import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import path from 'path';
import { AllConfigType } from 'src/configs/config.type';
import { IMailData } from 'src/interfaces';
import { FormsService } from '../forms/forms.service';
import { MailerService } from '../mailer/mailer.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class MailService {
  private appConfig: AllConfigType['app'];
  private workingDirectory: string;
  private frontendDomain: string;

  constructor(
    @Inject(forwardRef(() => FormsService))
    private readonly formService: FormsService,
    private readonly userService: UsersService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.appConfig = this.configService.getOrThrow('app');
    this.workingDirectory = this.appConfig.workingDirectory;
    this.frontendDomain = this.appConfig.frontendDomain;
  }

  private async sendEmail(
    to: string | string[],
    subject: string,
    context: Record<string, any>,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      templatePath: path.join(
        this.workingDirectory,
        'src',
        'modules',
        'mail',
        'mail-templates',
        'notification.hbs',
      ),
      context: {
        ...context,
        app_name: this.appConfig.name,
      },
    });
  }

  async forgotPassword(IMailData: IMailData<{ hash: string }>): Promise<void> {
    const url = new URL(`${this.frontendDomain}/password-change`);
    url.searchParams.set('hash', IMailData.data.hash);

    const context = {
      title: 'Reset password',
      url: url.toString(),
      actionTitle: 'Reset Password',
      text1: 'Someone has requested to reset your password.',
      text2: 'This link will expire soon.',
      text3: 'Click the button below to reset your password.',
      text4: 'Please ignore this email if you did not request.',
    };

    await this.sendEmail(IMailData.to, context.title, context);
  }

  async notifyForm(
    IMailData: IMailData<{
      formType: string;
      formTitle: string;
      action: 'published' | 'approved' | 'rejected';
    }>,
  ): Promise<void> {
    const actionMap = {
      published: 'published',
      approved: 'approved',
      rejected: 'rejected',
    };

    const title = `A ${IMailData.data.formType} ${actionMap[IMailData.data.action]}`;
    const context = {
      title,
      url: '',
      actionTitle: 'View Form',
      text1: `${IMailData.data.formType} titled "${IMailData.data.formTitle}" has been ${IMailData.data.action}.`,
      text2: 'Please check the system for more details.',
      text3: 'This notification is automatically generated.',
      text4: 'If you have any questions, please contact support.',
    };

    await this.sendEmail(IMailData.to, title, context);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyFormsClosingSoon(): Promise<void> {
    const now = dayjs();
    const tomorrow = now.add(1, 'day');
    const forms = await this.formService.findFormsClosingSoon(
      tomorrow.toDate(),
    );
    for (const form of forms) {
      const context = {
        title: `Form "${form.title}" is closing soon`,
        url: `${this.frontendDomain}/forms/${form.id}`,
        actionTitle: 'View Form',
        text1: `The form "${form.title}" will be closed on ${dayjs(form.closedAt).format('YYYY-MM-DD')}.`,
        text2:
          'Please make sure to complete the necessary actions before the deadline.',
        text3: 'This is an automatically generated reminder.',
        text4: 'If you have any questions, please contact support.',
      };
      const emails = await this.userService.findEmailToSendNotifications(
        form.formType.scope,
      );
      await this.sendEmail(emails, context.title, context);
    }
  }
}
