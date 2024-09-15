import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { EGender } from 'src/constants';
import { lowerCaseTransformer } from 'src/utils/transformers';

export class CreateUserDto {
  @ApiProperty({ example: 'John', type: String })
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({ example: 'Doe', type: String })
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({ example: 'user01@gmail.com', type: String })
  @IsNotEmpty()
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty({ type: String })
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Fresher', type: String })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  job_title?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(EGender)
  gender?: EGender;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  departmentId?: number;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  roleId: number;
}
