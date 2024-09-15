import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EFormTypeScope } from 'src/constants';

export class CreateFormTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEnum(EFormTypeScope)
  scope: EFormTypeScope;
}
