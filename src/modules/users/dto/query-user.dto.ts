import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { QueryDto } from 'src/common/dto/query.dto';

export class FilterUserDto {
  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  isActive?: boolean;
}

export class QueryUserDto extends QueryDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterUserDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterUserDto)
  filters?: FilterUserDto | null;
}
