import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Name of the role',
    example: 'Admin',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the role',
    example: 'Administrator with full access rights',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'List of permission IDs for this role',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  permissionIds: number[];
}
