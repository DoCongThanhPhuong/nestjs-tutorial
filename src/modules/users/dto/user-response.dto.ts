import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { EUserStatus } from 'src/constants';

class DepartmentDto {
  @ApiProperty({ description: 'Department ID' })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Name of the department' })
  @Expose()
  name: string;

  managerId: number;

  directorId: number;
}

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  firstname: string;

  @ApiProperty()
  @Expose()
  lastname: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phone: string;

  @ApiProperty()
  @Expose()
  avatar: string;

  @ApiProperty()
  @Expose()
  gender: string;

  @ApiProperty()
  @Expose()
  birthday: Date;

  @ApiProperty()
  @Expose()
  hicn: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  citizenId: string;

  @ApiProperty()
  @Expose()
  jobTitle: string;

  @ApiProperty()
  @Expose()
  isOfficial: boolean;

  @ApiProperty()
  @Expose()
  roleId: number;

  @ApiProperty()
  @Expose()
  @Type(() => DepartmentDto)
  department: DepartmentDto;

  departmentId: number;

  password: string;

  status: EUserStatus;
}

export class UserItemDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  code: string;

  @ApiProperty()
  @Expose()
  firstname: string;

  @ApiProperty()
  @Expose()
  lastname: string;
}
