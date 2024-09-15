import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/transformers';

export class CreateUserDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @IsNotEmpty()
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @MinLength(6)
  password: string;
}
