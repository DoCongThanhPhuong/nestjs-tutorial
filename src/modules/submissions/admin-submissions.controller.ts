import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationResponse, PaginationResponseDto } from 'src/common/dto';
import {
  QuerySubmissionDto,
  RejectSubmissionDto,
  SubmissionItemDto,
  SubmissionResponseDto,
} from './dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Admin/Submissions')
@ApiBearerAuth()
@Controller('admin/forms/:formId/submissions')
export class AdminSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({ summary: 'List all submissions' })
  @ApiOkResponse({ type: PaginationResponse(SubmissionItemDto) })
  @Get()
  listAllSubmissions(
    @Param('formId') formId: number,
    @Query() query: QuerySubmissionDto,
  ): Promise<PaginationResponseDto<SubmissionItemDto>> {
    return this.submissionsService.listSubmissionsByFormId(formId, query);
  }

  @ApiOperation({ summary: 'Report form submissions' })
  @ApiOkResponse()
  @Get('report')
  reportFormSubmissions(@Param('formId') formId: number) {
    return this.submissionsService.reportFormSubmissions(formId);
  }

  @ApiOperation({ summary: 'View a submission' })
  @ApiOkResponse({ type: SubmissionResponseDto })
  @Get(':submissionId')
  getOne(
    @Param('submissionId') submissionId: number,
    @Param('formId') formId: number,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.findOneSubmissionById(submissionId, formId);
  }

  @ApiOperation({ summary: 'Approve submission by id' })
  @ApiOkResponse()
  @Patch(':submissionId/approve')
  approveSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
  ): Promise<void> {
    return this.submissionsService.approveSubmissionById(formId, submissionId);
  }

  @ApiOperation({ summary: 'Reject submission by id' })
  @ApiOkResponse()
  @Patch(':submissionId/reject')
  rejectSubmissionById(
    @Param('formId') formId: number,
    @Param('submissionId') submissionId: number,
    @Body() rejectSubmissionDto: RejectSubmissionDto,
  ): Promise<void> {
    return this.submissionsService.rejectSubmissionById(
      formId,
      submissionId,
      rejectSubmissionDto,
    );
  }
}
