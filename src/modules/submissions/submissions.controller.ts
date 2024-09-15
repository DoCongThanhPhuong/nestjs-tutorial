import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import { CurrentUserId } from 'src/decorators';
import {
  QuerySubmissionDto,
  RejectSubmissionDto,
  SubmissionItemDto,
  SubmissionResponseDto,
  SubmitFormDto,
} from './dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('forms/:formId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'Submit form' })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @Post()
  submit(
    @Param('formId') formId: number,
    @Body() submitFormDto: SubmitFormDto,
    @Request() req,
  ): Promise<void> {
    return this.submissionsService.submitForm(formId, submitFormDto, req.user);
  }

  @ApiOperation({ summary: 'List employee submissions' })
  @ApiOkResponse({ type: PaginationResponse(SubmissionItemDto) })
  @Get()
  listEmployeeSubmissions(
    @Param('formId') formId: number,
    @Query() query: QuerySubmissionDto,
    @CurrentUserId() userId: number,
  ): Promise<PaginationResponseDto<SubmissionItemDto>> {
    return this.submissionsService.listSubmissionsByFormId(
      formId,
      query,
      userId,
    );
  }

  @ApiOperation({ summary: 'View own submission' })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @Get('own')
  getOwn(
    @CurrentUserId() userId: number,
    @Param('formId') formId: number,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.getOwnFormSubmission(userId, formId);
  }

  @ApiOperation({ summary: 'View an employee submission' })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @Get(':submissionId')
  getOne(
    @Param('submissionId') submissionId: number,
    @Param('formId') formId: number,
    @CurrentUserId() userId,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.findOneSubmissionById(
      submissionId,
      formId,
      userId,
    );
  }

  @ApiOperation({ summary: 'Approve submission by id' })
  @ApiOkResponse()
  @Patch(':submissionId/approve')
  approveSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.submissionsService.approveSubmissionById(
      formId,
      submissionId,
      userId,
    );
  }

  @ApiOperation({ summary: 'Reject submission by id' })
  @ApiOkResponse()
  @Patch(':submissionId/reject')
  rejectSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
    @Body() rejectSubmissionDto: RejectSubmissionDto,
    @CurrentUserId() userId: number,
  ): Promise<void> {
    return this.submissionsService.rejectSubmissionById(
      formId,
      submissionId,
      rejectSubmissionDto,
      userId,
    );
  }
}
