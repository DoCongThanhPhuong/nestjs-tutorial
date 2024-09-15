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

  @ApiOperation({ summary: 'Get all submissions' })
  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @Get()
  listAllSubmissions(
    @Param('formId') formId: number,
    @Query() query: QuerySubmissionDto,
  ) {
    return this.submissionsService.listSubmissionsByFormId(formId, query);
  }

  @ApiOkResponse({ type: PaginationResponse(SubmissionResponseDto) })
  @Get('report')
  reportFormSubmissions(@Param('formId') formId: number) {
    return this.submissionsService.reportFormSubmissions(formId);
  }

  @ApiOkResponse({})
  @Patch(':submissionId/approve')
  approveSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
  ) {
    return this.submissionsService.approveSubmissionById(formId, submissionId);
  }

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
