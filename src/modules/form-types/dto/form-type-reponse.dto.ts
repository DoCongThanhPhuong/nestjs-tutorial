import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { EFormTypeScope } from 'src/constants';

export class FormTypeResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  scope: EFormTypeScope;
}
