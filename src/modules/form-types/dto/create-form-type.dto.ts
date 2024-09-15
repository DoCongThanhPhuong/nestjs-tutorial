import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EFormTypeScope } from 'src/constants';

export class CreateFormTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsEnum(EFormTypeScope)
  @IsNotEmpty()
  scope: EFormTypeScope;
}
