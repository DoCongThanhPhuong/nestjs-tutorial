import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateFieldDto, FieldResponseDto, UpdateFieldDto } from './dto';
import { FieldsService } from './fields.service';

@ApiTags('Admin/Fields')
@ApiBearerAuth()
@Controller('admin/forms/:formId/fields')
export class AdminFieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @ApiOperation({ summary: 'Add field to form' })
  @ApiCreatedResponse({ type: FieldResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createField(
    @Param('formId') formId: number,
    @Body() createFieldDto: CreateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.createField(formId, createFieldDto);
  }

  @ApiOperation({ summary: 'Update form field' })
  @ApiOkResponse({ type: FieldResponseDto })
  @Patch(':fieldId')
  updateFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
    @Body() updateFieldDto: UpdateFieldDto,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.updateFieldById(formId, fieldId, updateFieldDto);
  }

  @ApiOperation({ summary: 'Delete form field' })
  @ApiOkResponse()
  @Delete(':fieldId')
  deleteFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
  ): Promise<void> {
    return this.fieldsService.deleteFieldById(formId, fieldId);
  }
}
