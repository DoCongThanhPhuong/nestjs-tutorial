import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormType } from './entities/form-type.entity';
import { FormTypesController } from './form-types.controller';
import { FormTypesService } from './form-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([FormType])],
  controllers: [FormTypesController],
  providers: [FormTypesService],
  exports: [FormTypesService],
})
export class FormTypesModule {}
