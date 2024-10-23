import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/transformers';

export class AuthForgotPasswordDto {
  @ApiProperty({ example: 'bido23082003@gmail.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;
}
