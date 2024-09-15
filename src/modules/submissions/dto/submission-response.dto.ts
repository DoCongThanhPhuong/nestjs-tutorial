import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ESubmissionStatus } from 'src/constants';
import { FieldResponseDto } from 'src/modules/fields/dto';
import { UserItemDto } from 'src/modules/users/dto';
import { FieldValueType } from 'src/utils/types';

export class FieldValueDto {
  @ApiProperty()
  @Expose()
  submissionId: number;

  @ApiProperty()
  @Expose()
  fieldId: number;

  @ApiProperty()
  @Expose()
  value: FieldValueType;

  @ApiProperty()
  @Expose()
  @Type(() => FieldResponseDto)
  field: FieldResponseDto;
}

export class SubmissionResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  rejectionReason: string | null;

  @ApiProperty()
  @Expose()
  submittedAt: Date | null;

  @ApiProperty()
  @Expose()
  formId: number;

  @ApiProperty()
  @Expose()
  employeeId: number;

  @ApiProperty()
  @Expose()
  managerId: number;

  @ApiProperty()
  @Expose()
  @Type(() => FieldValueDto)
  fieldValues: FieldValueDto[];
}

export class SubmissionItemDto {
  @Expose()
  id: string;

  @Expose()
  submittedAt: Date;

  @Expose()
  status: ESubmissionStatus;

  @Expose()
  @Type(() => UserItemDto)
  employee: UserItemDto;
}
