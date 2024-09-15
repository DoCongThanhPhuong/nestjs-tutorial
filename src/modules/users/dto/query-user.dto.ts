import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryDto } from 'src/common/dto';

export class QueryUserDto extends QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  departmentId?: number;
}
