import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { FieldResponseDto } from 'src/modules/fields/dto';

export class FieldValueDto {
  @ApiProperty()
  @Expose()
  submissionId: number;

  @ApiProperty()
  @Expose()
  fieldId: number;

  @ApiProperty()
  @Expose()
  value: string;

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
