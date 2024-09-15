import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import { CurrentUserId } from 'src/decorators';
import {
  CreateFormDto,
  FormItemDto,
  FormResponseDto,
  PublishFormDto,
  QueryFormDto,
  UpdateFormDto,
} from './dto';
import { FormsService } from './forms.service';

@ApiTags('Forms')
@ApiBearerAuth()
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @ApiOperation({ summary: 'Create a new form' })
  @ApiCreatedResponse({ type: FormResponseDto })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createFormDto: CreateFormDto,
    @CurrentUserId() userId: number,
  ): Promise<FormResponseDto> {
    return this.formsService.createForm(createFormDto, userId);
  }

  @ApiOperation({ summary: 'Get all published forms' })
  @ApiOkResponse({ type: PaginationResponse(FormItemDto) })
  @Get()
  listPublishedForms(
    @Query() query: QueryFormDto,
  ): Promise<PaginationResponseDto<FormItemDto>> {
    return this.formsService.listPublishedForms(query);
  }

  @ApiOperation({ summary: 'Get own forms' })
  @ApiOkResponse({ type: FormResponseDto })
  @Get('my-forms')
  listOwn(
    @CurrentUserId() userId: number,
    @Query() query: QueryFormDto,
  ): Promise<PaginationResponseDto<FormItemDto>> {
    return this.formsService.listForms(query, userId);
  }

  @ApiOperation({ summary: 'View a published form' })
  @ApiOkResponse({ type: FormResponseDto })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<FormResponseDto> {
    return this.formsService.findFormByIdWithCache(id);
  }

  @ApiOperation({ summary: 'Update own form' })
  @ApiOkResponse({ type: FormResponseDto })
  @Patch(':id')
  update(
    @Param('id') formId: number,
    @Body() updateFormDto: UpdateFormDto,
    @CurrentUserId() userId: number,
  ): Promise<FormResponseDto> {
    return this.formsService.updateForm(formId, updateFormDto, userId);
  }

  @ApiOperation({ summary: 'Publish own form' })
  @ApiOkResponse({ type: FormResponseDto })
  @Patch(':id/publish')
  publish(
    @Param('id') formId: number,
    @Body() publishFormDto: PublishFormDto,
    @CurrentUserId() userId: number,
  ): Promise<FormResponseDto> {
    return this.formsService.publishForm(formId, publishFormDto, userId);
  }

  @ApiOperation({ summary: 'View a draft' })
  @ApiOkResponse({ type: FormResponseDto })
  @Get('drafts/:id')
  findDraft(
    @Param('id') formId: number,
    @CurrentUserId() userId: number,
  ): Promise<FormResponseDto> {
    return this.formsService.findDraftById(formId, userId);
  }

  @ApiOperation({ summary: 'Delete form by id' })
  @ApiOkResponse({ type: FormResponseDto })
  @Delete(':id')
  deleteById(@Param('id') id: number): Promise<void> {
    return this.formsService.deleteForm(id);
  }
}
