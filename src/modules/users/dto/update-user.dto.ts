import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EUserStatus } from 'src/constants';
import { IsBeforeNow } from 'src/decorators';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  hicn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  avatar?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  citizenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @IsBeforeNow({ message: 'Birthday must be before now' })
  birthday?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  isOffical?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EUserStatus)
  status?: EUserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  roleId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  departmentId?: number | null;
}

export class UpdateProfileDto extends PartialType(
  OmitType(UpdateUserDto, [
    'isOffical',
    'roleId',
    'departmentId',
    'status',
    'password',
  ]),
) {}
