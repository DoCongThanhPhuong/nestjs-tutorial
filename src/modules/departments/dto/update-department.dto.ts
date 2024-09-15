import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ description: 'Name of the department' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Prefix employee code' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  prefix?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  managerId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  directorId?: number;
}
