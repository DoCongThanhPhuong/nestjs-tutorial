import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateFieldDto, FieldResponseDto, UpdateFieldDto } from './dto';
import { FieldsService } from './fields.service';

@ApiTags('admin/forms/:formId/fields')
@Controller('admin/forms/:formId/fields')
export class AdminFieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  createField(
    @Param('formId') formId: number,
    @Body() createFieldDto: CreateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.createField(formId, createFieldDto);
  }

  @Put(':fieldId')
  updateFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
    @Body() updateFieldDto: UpdateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.updateFieldById(formId, fieldId, updateFieldDto);
  }

  @Delete(':fieldId')
  deleteFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
  ): Promise<void> {
    return this.fieldsService.deleteFieldById(formId, fieldId);
  }
}
