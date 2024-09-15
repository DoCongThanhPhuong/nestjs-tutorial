import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseResponseDto } from 'src/common/dto';

export class UserResponseDto extends BaseResponseDto {
  @ApiProperty()
  @Expose()
  fullName: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  provider: string;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  password: string;
}
