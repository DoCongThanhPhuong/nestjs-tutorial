import { IsNotEmpty } from 'class-validator';

class FieldValueDto {
  @IsNotEmpty()
  fieldId: number;

  @IsNotEmpty()
  value: any;
}

export class SubmitFormDto {
  @IsNotEmpty()
  fieldValues: FieldValueDto[];
}
