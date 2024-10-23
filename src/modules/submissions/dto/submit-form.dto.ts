import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { fieldValueType } from 'src/utils/types';

class FieldValueDto {
  @ApiProperty()
  @IsNotEmpty()
  fieldId: number;

  @ApiProperty()
  @IsNotEmpty()
  value: fieldValueType;
}

export class SubmitFormDto {
  @ApiProperty({ type: FieldValueDto, isArray: true })
  @IsNotEmpty()
  fieldValues: FieldValueDto[];
}
