import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldsModule } from '../fields/fields.module';
import { FormsModule } from '../forms/forms.module';
import { MailModule } from '../mail/mail.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';
import { AdminSubmissionsController } from './admin-submissions.controller';
import { FieldValue } from './entities/field-value.entity';
import { Submission } from './entities/submission.entity';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, FieldValue]),
    UsersModule,
    FieldsModule,
    FormsModule,
    MailModule,
    FilesModule,
  ],
  controllers: [SubmissionsController, AdminSubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
