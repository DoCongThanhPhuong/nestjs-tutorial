import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormTypesModule } from '../form-types/form-types.module';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AdminFormsController } from './admin-forms.controller';
import { Form } from './entities/form.entity';
import { FormsController } from './forms.controller';
import { FormsService } from './forms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Form]),
    RedisModule,
    forwardRef(() => MailModule),
    UsersModule,
    FormTypesModule,
  ],
  controllers: [FormsController, AdminFormsController],
  providers: [FormsService],
  exports: [FormsService],
})
export class FormsModule {}
