import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import { CreateFieldDto, FieldResponseDto, UpdateFieldDto } from './dto';
import { FieldsService } from './fields.service';

@ApiTags('forms/:formId/fields')
@Controller('forms/:formId/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @Post()
  createField(
    @Param('formId') formId: number,
    @Body() createFieldDto: CreateFieldDto,
    @CurrentUserId() userId: number,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.createField(formId, createFieldDto, userId);
  }

  @Put(':fieldId')
  updateFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
    @Body() updateFieldDto: UpdateFieldDto,
    @CurrentUserId() userId: number,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.updateFieldById(
      formId,
      fieldId,
      updateFieldDto,
      userId,
    );
  }

  @Delete(':fieldId')
  deleteFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.fieldsService.deleteFieldById(formId, fieldId, userId);
  }
}
