import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectSubmissionDto {
  @ApiProperty({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  rejectionReason: string;
}
