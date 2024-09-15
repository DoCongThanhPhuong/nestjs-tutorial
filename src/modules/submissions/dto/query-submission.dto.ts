import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { QueryDto } from 'src/common/dto';
import { ESubmissionStatus } from 'src/constants';

export class QuerySubmissionDto extends QueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ESubmissionStatus)
  status?: ESubmissionStatus;
}
