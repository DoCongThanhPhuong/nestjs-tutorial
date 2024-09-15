import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import ms from 'ms';
import { AllConfigType } from 'src/configs/config.type';
import { AuthProvidersEnum } from 'src/constants';
import { SocialInterface } from 'src/interfaces';
import { convertTimeStringToSeconds } from 'src/utils/convert-time';
import { hashPassword } from 'src/utils/hash-password';
import { NullableType } from 'src/utils/types';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import {
  AuthEmailLoginDto,
  AuthRegisterLoginDto,
  LoginResponseDto,
} from './dto';

@Injectable()
export class AuthService {
  private authConfig: AllConfigType['auth'];

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
    private redisService: RedisService,
  ) {
    this.authConfig = this.configService.getOrThrow('auth', { infer: true });
  }

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new NotFoundException('User not found');

    if (user.provider !== AuthProvidersEnum.EMAIL)
      throw new BadRequestException(
        `Please login via provider: ${user.provider}`,
      );

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isValidPassword) throw new BadRequestException('Incorrect password');

    const { token, refreshToken, tokenExpires } = await this.getTokensData(
      user.id,
    );

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async validateSocialLogin(
    authProvider: AuthProvidersEnum,
    socialData: SocialInterface,
  ): Promise<LoginResponseDto> {
    let user: NullableType<UserResponseDto> = null;
    const socialEmail = socialData.email?.toLowerCase();
    let userByEmail: NullableType<UserResponseDto> = null;

    if (socialEmail) {
      userByEmail = await this.usersService.findByEmail(socialEmail);
    }

    if (socialData.id) {
      user = await this.usersService.findBySocialIdAndProvider({
        socialId: socialData.id,
        provider: authProvider,
      });
    }

    if (user) {
      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.updateById(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else if (socialData.id) {
      user = await this.usersService.create({
        email: socialEmail,
        password: null,
      });

      user = await this.usersService.findById(user.id);
    }

    if (!user) throw new NotFoundException('User not found');

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData(user.id);

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const user = await this.usersService.create({
      ...dto,
      email: dto.email,
    });

    const hash = await this.jwtService.signAsync(
      {
        confirmEmailUserId: user.id,
      },
      {
        secret: this.authConfig.confirmEmailSecret,
        expiresIn: this.authConfig.confirmEmailExpires,
      },
    );

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async confirmEmail(hash: string): Promise<void> {
    let userId: number;

    try {
      const jwtData = await this.jwtService.verifyAsync<{
        confirmEmailUserId: number;
      }>(hash, {
        secret: this.authConfig.confirmEmailSecret,
      });

      userId = jwtData.confirmEmailUserId;
    } catch {
      throw new BadRequestException('Invalid hash');
    }

    const user = await this.usersService.findById(userId);
    user.isActive = true;

    await this.usersService.updateById(user.id, user);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const key = await this.redisService.getKey(
      `forgot-password-user${user.id}`,
    );
    if (key)
      throw new BadRequestException('Another request has just been made');

    const tokenExpires = Date.now() + ms(this.authConfig.forgotExpires);

    const hash = await this.jwtService.signAsync(
      {
        forgotUserId: user.id,
      },
      {
        secret: this.authConfig.forgotSecret,
        expiresIn: this.authConfig.forgotExpires,
      },
    );

    const result = await this.redisService.setNXWithExpiration(
      `forgot-password-user${user.id}`,
      hash,
      convertTimeStringToSeconds(this.authConfig.forgotExpires),
    );
    if (!result) throw new BadRequestException('Request failed');

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
        tokenExpires,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    try {
      const jwtData = await this.jwtService.verifyAsync<{
        forgotUserId: number;
      }>(hash, {
        secret: this.authConfig.forgotSecret,
      });

      const userId = jwtData.forgotUserId;

      const key = await this.redisService.getKey(
        `forgot-password-user${userId}`,
      );
      if (!key)
        throw new BadRequestException('Password have just been changed');

      const user = await this.usersService.findById(userId);
      if (!user) throw new NotFoundException('User not found');

      user.password = await hashPassword(password);
      await this.usersService.updateById(user.id, user);
      await this.redisService.deleteKey(`forgot-password-user${userId}`);
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    oldRefreshToken: string,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const jwtData = await this.jwtService.verifyAsync<{
      userId: number;
    }>(oldRefreshToken, {
      secret: this.authConfig.refreshTokenSecret,
    });

    const { userId } = jwtData;
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const { token, refreshToken, tokenExpires } =
      await this.getTokensData(userId);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  private async getTokensData(userId: number) {
    const tokenExpires = Date.now() + ms(this.authConfig.accessTokenExpires);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        { userId },
        {
          secret: this.authConfig.accessTokenSecret,
          expiresIn: this.authConfig.accessTokenExpires,
        },
      ),
      await this.jwtService.signAsync(
        { userId },
        {
          secret: this.authConfig.refreshTokenSecret,
          expiresIn: this.authConfig.refreshTokenExpires,
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }
}
