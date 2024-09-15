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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from 'src/decorators';
import {
  QuerySubmissionDto,
  RejectSubmissionDto,
  SubmissionResponseDto,
  SubmitFormDto,
} from './dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('forms/:formId/submissions')
@ApiBearerAuth()
@Controller('forms/:formId/submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiCreatedResponse({ type: SubmissionResponseDto })
  @Post()
  submit(
    @Param('formId') formId: number,
    @Body() submitFormDto: SubmitFormDto,
    @Request() req,
  ) {
    return this.submissionsService.submitForm(formId, submitFormDto, req.user);
  }

  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @Get()
  listEmployeeSubmissions(
    @Param('formId') formId: number,
    @Query() query: QuerySubmissionDto,
    @CurrentUserId() userId: number,
  ) {
    return this.submissionsService.listSubmissionsByFormId(
      formId,
      query,
      userId,
    );
  }

  @ApiOkResponse({ type: [SubmissionResponseDto] })
  @Get('own')
  getOwn(@CurrentUserId() userId: number, @Param('formId') formId: number) {
    return this.submissionsService.getOwnFormSubmission(userId, formId);
  }

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
