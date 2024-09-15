import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PermissionResponseDto } from 'src/modules/permissions/dto';

export class RoleResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ type: [PermissionResponseDto] })
  @Expose()
  @Type(() => PermissionResponseDto)
  permissions: PermissionResponseDto[];
}

export class RoleItemDto extends OmitType(RoleResponseDto, ['permissions']) {}
