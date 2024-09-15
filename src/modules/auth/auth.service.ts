import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AllConfigType } from 'src/configs/config.type';
import { EUserStatus, FORGOT_PASSWORD_PREFIX } from 'src/constants';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import {
  AuthEmailLoginDto,
  ChangePasswordDto,
  LoginResponseDto,
  RefreshTokenDto,
} from './dto';
import ms from 'ms';

@Injectable()
export class AuthService {
  private authConfig: AllConfigType['auth'];

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly redisService: RedisService,
  ) {
    this.authConfig = this.configService.getOrThrow('auth', { infer: true });
  }

  async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findOneUserBy({
      email: loginDto.email,
      status: EUserStatus.ACTIVE,
    });
    if (!user) throw new NotFoundException('User not found');

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isValidPassword) throw new BadRequestException('Incorrect password');

    const { token, refreshToken } = await this.getTokensData(user.id);
    return {
      refreshToken,
      token,
      user,
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    userId: number,
  ): Promise<void> {
    const { password, oldPassword } = changePasswordDto;
    const foundUser = await this.usersService.findOneUserBy({
      id: userId,
      status: EUserStatus.ACTIVE,
    });
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      foundUser.password,
    );
    if (!isValidPassword) {
      throw new BadRequestException('Old password is incorrect');
    }
    await this.usersService.adminUpdateUserById(userId, {
      password,
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneUserBy({
      email,
      status: EUserStatus.ACTIVE,
    });
    if (!user) throw new NotFoundException('User not found');

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
      `${FORGOT_PASSWORD_PREFIX}${user.id}`,
      hash,
      ms(this.authConfig.forgotExpires) / 1000,
    );
    if (!result) throw new BadRequestException('Request failed');

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
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
        `${FORGOT_PASSWORD_PREFIX}${userId}`,
      );
      if (!key) {
        throw new BadRequestException('Password have just been changed');
      }

      await this.usersService.adminUpdateUserById(userId, { password });
      await this.redisService.deleteKey(`${FORGOT_PASSWORD_PREFIX}${userId}`);
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<Omit<LoginResponseDto, 'user'>> {
    const oldRefreshToken = refreshTokenDto.refreshToken;
    const jwtData = await this.jwtService.verifyAsync<{
      userId: number;
    }>(oldRefreshToken, {
      secret: this.authConfig.refreshTokenSecret,
    });

    const { userId } = jwtData;
    const user = await this.usersService.findUserByIdWithCache(userId);
    if (!user) throw new UnauthorizedException();

    const { token, refreshToken } = await this.getTokensData(userId);

    return {
      token,
      refreshToken,
    };
  }

  private async getTokensData(userId: number) {
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
    };
  }
}
