import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', type: String })
  @IsOptional()
  fullName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
