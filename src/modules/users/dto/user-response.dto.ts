import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { DepartmentResponseDto } from 'src/modules/departments/dto';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  departmentId: number;

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
  @Type(() => DepartmentResponseDto)
  department: DepartmentResponseDto;

  @Type(() => DepartmentResponseDto)
  departmentsManaged: DepartmentResponseDto[];

  @Type(() => DepartmentResponseDto)
  managedDepartment: DepartmentResponseDto;

  password: string;
}

export class UserItemDto {
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
}
