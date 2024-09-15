import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Name of the department' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Prefix for the department' })
  @IsNotEmpty()
  @IsString()
  prefix: string;
}
