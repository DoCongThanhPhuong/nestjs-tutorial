import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { AllConfigType } from 'src/configs/config.type';
import { IMailData } from 'src/interfaces';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(IMailData: IMailData<{ hash: string }>): Promise<void> {
    const emailConfirmTitle = 'Email Confirmation';
    const text1 = 'Thank you for registering an account';
    const text2 =
      'Please click the button below to confirm your email address and complete the registration on';
    const text3 = 'If you did not make this request, please ignore this email.';

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', IMailData.data.hash);

    await this.mailerService.sendMail({
      to: IMailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async forgotPassword(
    IMailData: IMailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const expirationTime = await this.configService.get('auth.forgotExpires', {
      infer: true,
    });
    const resetPasswordTitle = 'Reset password';
    const text1 = 'Someone has requested to reset your password.';
    const text2 = 'Click the button below to reset your password.';
    const text3 = `This link will expire in ${expirationTime}.`;
    const text4 =
      'If you did not request a password reset, please ignore this email.';

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', IMailData.data.hash);
    url.searchParams.set('expires', IMailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: IMailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }
}
