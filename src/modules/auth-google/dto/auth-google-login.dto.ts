import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthGoogleLoginDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  idToken: string;
}
