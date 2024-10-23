import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse } from 'src/common/dto';
import {
  QuerySubmissionDto,
  RejectSubmissionDto,
  SubmissionResponseDto,
} from './dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('admin/forms/:formId/submissions')
@ApiBearerAuth()
@Controller('admin/forms/:formId/submissions')
export class AdminSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'List all submissions' })
  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @Get()
  listAllSubmissions(
    @Param('formId') formId: number,
    @Query() query: QuerySubmissionDto,
  ) {
    return this.submissionsService.listSubmissionsByFormId(formId, query);
  }

  @ApiOperation({ summary: 'Report form submissions' })
  @ApiOkResponse({ type: PaginationResponse(SubmissionResponseDto) })
  @Get('report')
  reportFormSubmissions(@Param('formId') formId: number) {
    return this.submissionsService.reportFormSubmissions(formId);
  }

  @ApiOperation({ summary: 'View a submission' })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @Get(':submissionId')
  getOne(@Param() submissionId: number, @Param('formId') formId: number) {
    return this.submissionsService.findOneSubmissionById(submissionId, formId);
  }

  @ApiOperation({ summary: 'Approve submission by id' })
  @ApiOkResponse({})
  @Patch(':submissionId/approve')
  approveSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
  ) {
    return this.submissionsService.approveSubmissionById(formId, submissionId);
  }

  @ApiOperation({ summary: 'Reject submission by id' })
  @ApiOkResponse({})
  @Patch(':submissionId/reject')
  rejectSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
    @Body() rejectSubmissionDto: RejectSubmissionDto,
  ) {
    return this.submissionsService.rejectSubmissionById(
      formId,
      submissionId,
      rejectSubmissionDto,
    );
  }
}
