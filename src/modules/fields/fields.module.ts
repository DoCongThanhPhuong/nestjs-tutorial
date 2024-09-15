import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormsModule } from '../forms/forms.module';
import { Field } from './entities/field.entity';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { AdminFieldsController } from './admin-fields.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Field]), FormsModule],
  controllers: [FieldsController, AdminFieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
