import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({
    description: 'Title of the form',
    example: 'Probation Form',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the form',
    example: 'Probation Form 2024',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the form', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  formTypeId: number;
}
