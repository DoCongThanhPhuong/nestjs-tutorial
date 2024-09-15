import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from 'src/common/dto';
import { FORM_CACHE_PREFIX } from 'src/constants';
import { hasChildEntities } from 'src/utils/has-children-entities';
import { paginateData } from 'src/utils/paginate-data';
import { NullableType } from 'src/utils/types';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { FormTypesService } from '../form-types/form-types.service';
import { MailService } from '../mail/mail.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import {
  CreateFormDto,
  FormItemDto,
  FormResponseDto,
  PublishFormDto,
  QueryFormDto,
  UpdateFormDto,
} from './dto';
import { Form } from './entities/form.entity';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private readonly formRepository: Repository<Form>,
    @Inject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    private readonly redisService: RedisService,
    private readonly userService: UsersService,
    private readonly formTypeService: FormTypesService,
  ) {}

  async createForm(
    createFormDto: CreateFormDto,
    creatorId: number,
  ): Promise<FormResponseDto> {
    const { title, description, formTypeId } = createFormDto;

    const form = this.formRepository.create({
      title,
      description,
      formTypeId,
      creatorId,
    });

    const newForm = await this.formRepository.save(form);
    await this.redisService.deleteKey(`${FORM_CACHE_PREFIX}${newForm.id}`);
    return plainToInstance(FormResponseDto, newForm);
  }

  async findFormById(id: number, relations: string[] = []): Promise<Form> {
    const form = await this.formRepository.findOne({
      where: { id },
      relations,
    });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }

  async publishForm(
    formId: number,
    publishFormDto: PublishFormDto,
    userId?: number,
  ) {
    const form = await this.formRepository.findOne({ where: { id: formId } });
    if (!form) throw new NotFoundException('Form not found');
    if (form.isPublished) throw new NotFoundException('The form is published');

    if (userId && userId !== form.creatorId)
      throw new BadRequestException('You are not the creator');

    form.isPublished = true;
    form.publishedAt = new Date();
    form.closedAt = publishFormDto.closedAt;
    const savedForm = await this.formRepository.save(form);
    await this.redisService.deleteKey(`${FORM_CACHE_PREFIX}${formId}`);

    const formType = await this.formTypeService.findOne(form.formTypeId);

    const emails = await this.userService.findEmailToSendNotifications(
      formType.scope,
    );

    await this.mailService.notifyForm({
      to: emails,
      data: {
        formType: formType.name,
        formTitle: form.title,
        action: 'published',
      },
    });

    return plainToInstance(FormResponseDto, savedForm);
  }

  async listPublishedForms(
    query: QueryFormDto,
  ): Promise<PaginationResponseDto<FormItemDto>> {
    const { page, size, formTypeId } = query;
    const where: FindOptionsWhere<Form> = { isPublished: true };
    if (formTypeId) where.formTypeId = formTypeId;

    const [forms, total] = await this.formRepository.findAndCount({
      skip: (page - 1) * size,
      select: ['id', 'title', 'publishedAt', 'closedAt'],
      take: size,
      where: where,
      order: { id: 'DESC' },
    });

    return paginateData(plainToInstance(FormItemDto, forms), page, size, total);
  }

  async findFormByIdWithCache(
    formId: number,
  ): Promise<NullableType<FormResponseDto>> {
    const cacheKey = `${FORM_CACHE_PREFIX}${formId}`;
    const cacheValue = await this.redisService.getKey(cacheKey);

    if (cacheValue) return JSON.parse(cacheValue);

    const form = await this.formRepository.findOne({
      where: { id: formId, isPublished: true },
      relations: ['fields', 'formType'],
    });

    const formResponse = form ? plainToInstance(FormResponseDto, form) : null;

    await this.redisService.setWithExpiration(
      cacheKey,
      JSON.stringify(formResponse),
      28800,
    );

    return formResponse;
  }

  async updateForm(
    formId: number,
    updateFormDto: UpdateFormDto,
    userId?: number,
  ): Promise<FormResponseDto> {
    const form = await this.findFormById(formId);
    if (userId && userId !== form.creatorId) {
      throw new BadRequestException('You are not the creator');
    }
    Object.assign(form, updateFormDto);
    const updatedForm = await this.formRepository.save(form);
    return plainToInstance(FormResponseDto, updatedForm);
  }

  async deleteForm(formId: number): Promise<void> {
    const form = await this.findFormById(formId);
    if (!form) throw new NotFoundException('Form not found');
    const isUnable = await hasChildEntities(
      this.formRepository,
      formId,
      'submissions',
    );

    if (isUnable) throw new BadRequestException('Unable to delete form');

    await this.redisService.deleteKey(`${FORM_CACHE_PREFIX}${formId}`);
    await this.formRepository.delete(formId);
  }

  async listForms(
    query: QueryFormDto,
    userId?: number,
  ): Promise<PaginationResponseDto<FormItemDto>> {
    const { page, size, formTypeId, isPublished } = query;
    const where: FindOptionsWhere<Form> = {};
    if (userId) where.creatorId = userId;
    if (formTypeId) where.formTypeId = formTypeId;
    if (isPublished) where.isPublished = isPublished;

    const [forms, total] = await this.formRepository.findAndCount({
      skip: (page - 1) * size,
      select: ['id', 'title', 'publishedAt', 'closedAt'],
      take: size,
      where: where,
      order: { id: 'DESC' },
    });

    return paginateData(plainToInstance(FormItemDto, forms), page, size, total);
  }

  async findDraftById(
    formId: number,
    userId?: number,
  ): Promise<FormResponseDto> {
    const form = await this.formRepository.findOne({
      where: { id: formId, isPublished: false },
      relations: ['fields', 'formType'],
    });
    if (!form) throw new NotFoundException('Form not found');
    if (userId && form.creatorId !== userId) {
      throw new NotFoundException('Form not found');
    }
    return plainToInstance(FormResponseDto, form);
  }

  async findFormsClosingSoon(closedAt: Date): Promise<Form[]> {
    return this.formRepository.find({
      where: {
        isPublished: true,
        closedAt: Between(new Date(), closedAt),
      },
      relations: ['formType'],
    });
  }
}
