import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EMethod } from 'src/constants';

export class CreatePermissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(EMethod)
  method: EMethod;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  path: string;
}
