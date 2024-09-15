import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsAfterNow } from 'src/decorators';

export class UpdateFormDto {
  @ApiProperty({
    description: 'Title of the form',
    example: 'User Feedback Form',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Description of the form',
    example: 'This form is used to collect user feedback',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @IsAfterNow({ message: 'Closed time must be after now' })
  closedAt?: Date;
}
