import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { FieldValueType } from 'src/utils/types';

class FieldValueDto {
  @ApiProperty()
  @IsNotEmpty()
  fieldId: number;

  @ApiProperty()
  @IsNotEmpty()
  value: FieldValueType;
}

export class SubmitFormDto {
  @ApiProperty({ type: FieldValueDto, isArray: true })
  @IsNotEmpty()
  fieldValues: FieldValueDto[];
}
