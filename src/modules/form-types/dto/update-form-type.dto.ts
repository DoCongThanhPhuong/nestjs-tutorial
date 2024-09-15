import { PartialType } from '@nestjs/swagger';
import { CreateFormTypeDto } from './create-form-type.dto';

export class UpdateFormTypeDto extends PartialType(CreateFormTypeDto) {}
