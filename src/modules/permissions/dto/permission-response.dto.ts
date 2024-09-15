import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PermissionResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  method: string;

  @ApiProperty()
  @Expose()
  path: string;
}
