import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Max, Min } from 'class-validator';

export class QueryDto {
  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default page 1. Min is 1',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  page = 1;

  @ApiProperty({
    type: Number,
    required: false,
    description: 'Default limit 10 rows. Min is 1 and max is 50',
  })
  @Optional()
  @Transform(({ value }) => Number(value))
  @Min(1)
  @Max(50)
  size = 10;
}
