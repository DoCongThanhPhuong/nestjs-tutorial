import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserItemDto } from 'src/modules/users/dto';

export class DepartmentResponseDto {
  @ApiProperty({ description: 'Department ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Name of the department' })
  @Expose()
  name: string;

  @ApiProperty({ type: UserItemDto })
  @Expose()
  manager: UserItemDto;

  @ApiProperty({ type: UserItemDto })
  @Expose()
  director: UserItemDto;

  managerId: number;

  directorId: number;
}

export class DepartmentItemDto extends OmitType(DepartmentResponseDto, [
  'manager',
  'director',
]) {}
