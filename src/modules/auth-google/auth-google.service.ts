import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AllConfigType } from 'src/configs/config.type';
import { SocialInterface } from 'src/interfaces';
import { AuthGoogleLoginDto } from './dto/auth-google-login.dto';

@Injectable()
export class AuthGoogleService {
  private google: OAuth2Client;
  constructor(private configService: ConfigService<AllConfigType>) {
    this.google = new OAuth2Client(
      configService.get('google.clientId', { infer: true }),
      configService.get('google.clientSecret', { infer: true }),
    );
  }

  async getProfileByToken(
    loginDto: AuthGoogleLoginDto,
  ): Promise<SocialInterface> {
    const ticket = await this.google.verifyIdToken({
      idToken: loginDto.idToken,
      audience: [
        this.configService.getOrThrow('google.clientId', { infer: true }),
      ],
    });

    const data = ticket.getPayload();
    if (!data) throw new BadRequestException('Invalid token');

    return {
      id: data.sub,
      email: data.email,
      fullName: `${data.given_name} ${data.family_name}`,
    };
  }
}
