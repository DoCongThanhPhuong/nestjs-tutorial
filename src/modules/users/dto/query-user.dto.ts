import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryDto } from 'src/common/dto';
import { EUserStatus } from 'src/constants';
import { upperCaseTransformer } from 'src/utils/transformers';

export class QueryUserDto extends QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(upperCaseTransformer)
  @IsEnum(EUserStatus)
  status?: EUserStatus;
}
