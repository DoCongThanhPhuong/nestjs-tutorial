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
import { CurrentUserId } from 'src/decorators';
import { CreateFieldDto, FieldResponseDto, UpdateFieldDto } from './dto';
import { FieldsService } from './fields.service';

@ApiTags('Fields')
@ApiBearerAuth()
@Controller('forms/:formId/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @ApiOperation({ summary: 'Add field to form' })
  @ApiCreatedResponse({ type: FieldResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createField(
    @Param('formId') formId: number,
    @Body() createFieldDto: CreateFieldDto,
    @CurrentUserId() userId: number,
  ): Promise<FieldResponseDto> {
    return this.fieldsService.createField(formId, createFieldDto, userId);
  }

  @ApiOperation({ summary: 'Update form field' })
  @ApiOkResponse({ type: FieldResponseDto })
  @Patch(':fieldId')
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

  @ApiOperation({ summary: 'Delete form field' })
  @ApiOkResponse()
  @Delete(':fieldId')
  deleteFieldById(
    @Param('formId') formId: number,
    @Param('fieldId') fieldId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.fieldsService.deleteFieldById(formId, fieldId, userId);
  }
}
