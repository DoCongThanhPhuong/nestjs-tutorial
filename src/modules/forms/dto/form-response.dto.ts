import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FieldResponseDto } from 'src/modules/fields/dto';
import { FormTypeResponseDto } from 'src/modules/form-types/dto';

export class FormResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  isPublished: boolean;

  @ApiProperty()
  @Expose()
  publishedAt: Date;

  @ApiProperty()
  @Expose()
  closedAt: Date;

  @ApiProperty()
  @Expose()
  @Type(() => FormTypeResponseDto)
  formType: FormTypeResponseDto;

  @ApiProperty({ type: [FieldResponseDto] })
  @Expose()
  @Type(() => FieldResponseDto)
  fields: FieldResponseDto[];
}

export class FormItemDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  publishedAt: Date;

  @ApiProperty()
  @Expose()
  closedAt: Date;
}
