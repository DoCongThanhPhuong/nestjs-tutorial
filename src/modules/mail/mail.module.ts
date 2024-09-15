import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { FormsModule } from '../forms/forms.module';
import { MailerModule } from '../mailer/mailer.module';
import { UsersModule } from '../users/users.module';
import { MailService } from './mail.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => FormsModule),
    ConfigModule,
    MailerModule,
    UsersModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
