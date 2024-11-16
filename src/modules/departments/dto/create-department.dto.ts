import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Finance department', type: String })
  @IsNotEmpty()
  @IsString()
  name: string;
}
