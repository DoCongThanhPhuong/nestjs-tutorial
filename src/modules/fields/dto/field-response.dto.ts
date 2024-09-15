import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EFieldType } from 'src/constants';
import { FieldOptionsType } from 'src/utils/types';

export class FieldResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  label: string;

  @ApiProperty()
  @Expose()
  type: EFieldType;

  @ApiProperty()
  @Expose()
  required: boolean;

  @ApiProperty()
  @Expose()
  options: FieldOptionsType;
}
