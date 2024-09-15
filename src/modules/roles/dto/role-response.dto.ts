import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PermissionResponseDto } from 'src/modules/permissions/dto';

export class RoleResponseDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  @Type(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];
}
