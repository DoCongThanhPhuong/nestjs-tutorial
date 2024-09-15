import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class QueryFormDto extends QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  formTypeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isPublished?: boolean;
}
