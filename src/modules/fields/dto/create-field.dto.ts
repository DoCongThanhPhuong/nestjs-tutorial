import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EFieldType } from 'src/constants';
import { FieldOptionsType } from 'src/utils/types';

export class CreateFieldDto {
  @ApiProperty({ description: 'Label for the field', example: 'Address' })
  @IsNotEmpty()
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Type of the field',
    enum: EFieldType,
    example: EFieldType.CHECKBOX,
  })
  @IsEnum(EFieldType)
  type: EFieldType;

  @ApiProperty({ description: 'Whether the field is required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiProperty({
    description: 'Options for the field',
    example: ['Option 1', 'Option 2'],
  })
  @IsOptional()
  options: FieldOptionsType;
}
