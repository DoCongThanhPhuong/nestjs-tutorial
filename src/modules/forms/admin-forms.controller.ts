import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import {
  FormItemDto,
  FormResponseDto,
  PublishFormDto,
  QueryFormDto,
  UpdateFormDto,
} from './dto';
import { FormsService } from './forms.service';

@ApiTags('Admin/Forms')
@ApiBearerAuth()
@Controller('admin/forms')
export class AdminFormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ summary: 'List all forms' })
  @ApiOkResponse({ type: PaginationResponse(FormItemDto) })
  @Get()
  listForms(
    @Query() query: QueryFormDto,
  ): Promise<PaginationResponseDto<FormItemDto>> {
    return this.formsService.listForms(query);
  }

  @ApiOperation({ summary: 'Publish a form' })
  @ApiOkResponse({ type: FormResponseDto })
  @Patch(':id/publish')
  publish(
    @Param('id') formId: number,
    @Body() publishFormDto: PublishFormDto,
  ): Promise<FormResponseDto> {
    return this.formsService.publishForm(formId, publishFormDto);
  }

  @ApiOperation({ summary: 'Update form by id' })
  @ApiOkResponse({ type: FormResponseDto })
  @Patch(':id')
  update(
    @Param('id') formId: number,
    @Body() updateFormDto: UpdateFormDto,
  ): Promise<FormResponseDto> {
    return this.formsService.updateForm(formId, updateFormDto);
  }

  @ApiOperation({ summary: 'Delete form by id' })
  @ApiOkResponse({ type: FormResponseDto })
  @Delete(':id')
  deleteById(@Param('id') id: number): Promise<void> {
    return this.formsService.deleteForm(id);
  }

  @ApiOperation({ summary: 'View a draft' })
  @ApiOkResponse({ type: FormResponseDto })
  @Get('drafts/:id')
  findDraft(@Param('id') formId: number): Promise<FormResponseDto> {
    return this.formsService.findDraftById(formId);
  }
}
