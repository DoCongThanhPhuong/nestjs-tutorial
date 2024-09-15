import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({
    description: 'Title of the form',
    example: 'User Feedback Form',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description of the form',
    example: 'This form is used to collect user feedback',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Type of the form', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  formTypeId: number;
}
