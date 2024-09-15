import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DepartmentResponseDto {
  @ApiProperty({ description: 'Name of the department' })
  @Expose()
  name: string;

  prefix: string;

  @ApiProperty({ description: 'ID of the manager' })
  @Expose()
  managerId: number;

  @ApiProperty({ description: 'ID of the director' })
  @Expose()
  directorId: number;
}
