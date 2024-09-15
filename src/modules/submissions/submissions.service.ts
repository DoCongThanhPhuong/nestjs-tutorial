import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from 'src/common/dto';
import { EFieldType, EFormTypeScope, ESubmissionStatus } from 'src/constants';
import { paginateData } from 'src/utils/paginate-data';
import { validateFieldValue } from 'src/utils/validate-field-value';
import { Repository } from 'typeorm';
import { FieldResponseDto } from '../fields/dto';
import { FieldsService } from '../fields/fields.service';
import { FilesService } from '../files/files.service';
import { FormsService } from '../forms/forms.service';
import { MailService } from '../mail/mail.service';
import { UserResponseDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import {
  QuerySubmissionDto,
  RejectSubmissionDto,
  SubmissionItemDto,
  SubmissionResponseDto,
  SubmitFormDto,
} from './dto';
import { FieldValue } from './entities/field-value.entity';
import { Submission } from './entities/submission.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepository: Repository<Submission>,
    @InjectRepository(FieldValue)
    private readonly fieldValueRepository: Repository<FieldValue>,
    @Inject(forwardRef(() => FormsService))
    private readonly formService: FormsService,
    private readonly usersService: UsersService,
    private readonly fieldService: FieldsService,
    private readonly mailService: MailService,
    private readonly filesService: FilesService,
  ) {}

  async submitForm(
    formId: number,
    submitFormDto: SubmitFormDto,
    user: UserResponseDto,
  ): Promise<void> {
    const { fieldValues } = submitFormDto;
    const form = await this.formService.findFormByIdWithCache(formId);
    if (!form) throw new NotFoundException('Form not found');
    if (!form.isPublished) {
      throw new BadRequestException('Form is not published');
    }
    const currentTime = new Date();
    if (form.closedAt < currentTime) {
      throw new BadRequestException('Form is closed');
    }

    if (!this.usersService.canSubmitForm(user, form.formType.scope)) {
      throw new BadRequestException(
        'This form type is not for the current user',
      );
    }

    const fields = await this.fieldService.getFormFields(formId);
    fields.forEach((field) => {
      if (field.required) {
        const matchingFieldValue = fieldValues.find(
          (fieldValue) => fieldValue.fieldId === field.id,
        );

        if (!matchingFieldValue || !matchingFieldValue.value) {
          throw new BadRequestException(
            `Field with ID ${field.id} ${field.label} is required`,
          );
        }
      }
    });

    const fieldMap = new Map<number, FieldResponseDto>();
    fields.forEach((field) => fieldMap.set(field.id, field));

    fieldValues.forEach((fieldValue) => {
      const field = fieldMap.get(fieldValue.fieldId);

      if (!field) {
        throw new BadRequestException(
          `Field with ID ${fieldValue.fieldId} does not exist.`,
        );
      }

      const isValid = validateFieldValue(
        field.type,
        fieldValue.value,
        field.options || [],
      );

      if (!isValid) {
        throw new BadRequestException(
          `Invalid value for field ${field.label} with ID ${field.id}`,
        );
      }
    });

    let submission = await this.submissionRepository.findOne({
      where: {
        employee: { id: user.id },
        form: { id: formId },
      },
    });

    if (submission) {
      if (submission.status === ESubmissionStatus.APPROVED) {
        throw new BadRequestException('Submission is approved');
      }
      if (submission.status === ESubmissionStatus.PENDING) {
        throw new BadRequestException('Submission is pending');
      }

      submission.rejectionReason = null;
      await this.deleteFieldValues(submission.id);
    } else {
      const directManagerId =
        user.id === user.department?.managerId
          ? user.department?.directorId
          : user.department?.managerId;
      if (!directManagerId) {
        throw new NotFoundException('Direct manager not found');
      }

      submission = this.submissionRepository.create({
        managerId: directManagerId,
        employeeId: user.id,
        formId,
      });
    }

    submission.status = ESubmissionStatus.PENDING;
    submission.submittedAt = new Date();
    submission = await this.submissionRepository.save(submission);

    const newFieldValues = fieldValues.map((fieldValue) =>
      this.fieldValueRepository.create({
        submissionId: submission.id,
        fieldId: fieldValue.fieldId,
        value: fieldValue.value,
      }),
    );
    await this.fieldValueRepository.save(newFieldValues);
  }

  async getOwnFormSubmission(
    userId: number,
    formId: number,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .where('submission.employeeId = :userId', { userId })
      .andWhere('submission.formId = :formId', { formId })
      .getOne();
    if (!submission) throw new NotFoundException('Submission not found');

    const formattedSubmission = await this.processFieldValues(submission);
    return plainToInstance(SubmissionResponseDto, formattedSubmission);
  }

  async findOneSubmissionById(
    submissionId: number,
    formId: number,
    userId?: number,
  ) {
    const submission = await this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.fieldValues', 'fieldValues')
      .leftJoinAndSelect('fieldValues.field', 'field')
      .where('submission.id = :submissionId', { submissionId })
      .andWhere('submission.formId = :formId', { formId })
      .getOne();

    if (!submission) throw new NotFoundException('Submission not found');

    if (userId && submission.managerId !== userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    const formattedSubmission = await this.processFieldValues(submission);
    return plainToInstance(SubmissionResponseDto, formattedSubmission);
  }

  async approveSubmissionById(
    formId: number,
    submissionId: number,
    managerId?: number,
  ): Promise<void> {
    const form = await this.formService.findFormByIdWithCache(formId);
    if (!form) throw new NotFoundException('Form not found');
    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, formId },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.status !== ESubmissionStatus.PENDING) {
      throw new BadRequestException('Submission is approved or rejected');
    }

    if (managerId && submission.managerId !== managerId) {
      throw new ForbiddenException('Forbidden resource');
    }

    submission.status = ESubmissionStatus.APPROVED;
    await this.submissionRepository.save(submission);

    const employee = await this.usersService.findUserByIdWithCache(
      submission.employeeId,
    );
    await this.mailService.notifyForm({
      to: employee.email,
      data: {
        formType: form.formType.name,
        formTitle: form.title,
        action: 'approved',
      },
    });
  }

  async rejectSubmissionById(
    formId: number,
    submissionId: number,
    rejectSubmissionDto: RejectSubmissionDto,
    managerId?: number,
  ): Promise<void> {
    const form = await this.formService.findFormByIdWithCache(formId);
    if (!form) throw new NotFoundException('Form not found');

    const submission = await this.submissionRepository.findOne({
      where: { id: submissionId, formId },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.status !== ESubmissionStatus.PENDING) {
      throw new BadRequestException('Submission is approved or rejected');
    }
    if (managerId && submission.managerId !== managerId) {
      throw new ForbiddenException('Forbidden resource');
    }

    submission.status = ESubmissionStatus.REJECTED;
    submission.rejectionReason = rejectSubmissionDto.rejectionReason;
    await this.submissionRepository.save(submission);

    const employee = await this.usersService.findUserByIdWithCache(
      submission.employeeId,
    );
    await this.mailService.notifyForm({
      to: employee.email,
      data: {
        formType: form.formType.name,
        formTitle: form.title,
        action: 'rejected',
      },
    });
  }

  async reportFormSubmissions(formId: number) {
    const form = await this.formService.findFormByIdWithCache(formId);
    if (!form) throw new NotFoundException('Form not found');

    const scope = form.formType.scope;
    const isOfficial =
      scope === EFormTypeScope.PROBATION
        ? false
        : scope === EFormTypeScope.PERMANENT
          ? true
          : undefined;

    const employeeIds = await this.usersService.getAllUserIds(isOfficial);
    const submissions = await this.submissionRepository
      .createQueryBuilder('submission')
      .select(['submission.id', 'submission.status', 'employee.id'])
      .innerJoin('submission.employee', 'employee')
      .where('submission.form_id = :formId', { formId })
      .andWhere('employee_id IN (:...employeeIds)', {
        employeeIds,
      })
      .getMany();

    const submittedCount = submissions.map(
      (submission) => submission.employee.id,
    ).length;

    const pendingCount = submissions.filter(
      (submission) => submission.status === ESubmissionStatus.PENDING,
    ).length;

    const approvedCount = submissions.filter(
      (submission) => submission.status === ESubmissionStatus.APPROVED,
    ).length;

    const rejectedCount = submissions.filter(
      (submission) => submission.status === ESubmissionStatus.REJECTED,
    ).length;

    return {
      total: employeeIds.length,
      submitted: submittedCount,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };
  }

  async listSubmissionsByFormId(
    formId: number,
    query: QuerySubmissionDto,
    managerId?: number,
  ): Promise<PaginationResponseDto<SubmissionItemDto>> {
    const { page, size, status } = query;
    const queryBuilder = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.employee', 'employee')
      .select([
        'submission.id',
        'submission.submittedAt',
        'submission.status',
        'employee.id',
        'employee.firstname',
        'employee.lastname',
        'employee.code',
      ])
      .where('submission.formId = :formId', { formId });

    if (managerId) {
      queryBuilder.andWhere('submission.managerId = :managerId', { managerId });
    }

    if (status) {
      queryBuilder.andWhere('submission.status = :status', { status });
    }

    const [submissions, total] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return paginateData(
      plainToInstance(SubmissionItemDto, submissions),
      page,
      size,
      total,
    );
  }

  async processFieldValues(
    submission: SubmissionResponseDto,
  ): Promise<SubmissionResponseDto> {
    for (const fieldValue of submission.fieldValues) {
      if (fieldValue.field.type === EFieldType.UPLOAD) {
        const fileName = fieldValue.value as string;
        const url = await this.filesService.getFileUrl(fileName);
        fieldValue.value = url;
      }
    }

    return submission;
  }

  async deleteFieldValues(submissionId: number) {
    const fieldValues = await this.fieldValueRepository.find({
      where: { submissionId },
      relations: ['field'],
    });

    for (const fieldValue of fieldValues) {
      if (fieldValue.field.type === EFieldType.UPLOAD) {
        const fileName = fieldValue.value as string;
        await this.filesService.deleteFile(fileName);
      }
    }
    await this.fieldValueRepository.remove(fieldValues);
  }
}
