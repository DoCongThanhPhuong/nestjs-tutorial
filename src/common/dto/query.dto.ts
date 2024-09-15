import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SortOrderEnum } from 'src/constants';
import { upperCaseTransformer } from 'src/utils/transformers';

export class SortDto {
  @ApiProperty()
  @IsString()
  orderBy: string;

  @Transform(upperCaseTransformer)
  @ApiProperty()
  @IsEnum(SortOrderEnum)
  order: SortOrderEnum;
}

export class QueryDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sort?: SortDto[] | null;
}
