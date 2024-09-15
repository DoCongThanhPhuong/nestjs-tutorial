import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validateField } from 'src/utils/validate-fields';
import { Repository } from 'typeorm';
import { FormsService } from '../forms/forms.service';
import { CreateFieldDto, FieldResponseDto, UpdateFieldDto } from './dto';
import { Field } from './entities/field.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
    private readonly formService: FormsService,
  ) {}

  async getFormFields(id: number) {
    return await this.fieldRepository.find({ where: { formId: id } });
  }

  async createField(
    formId: number,
    createFieldDto: CreateFieldDto,
    userId?: number,
  ): Promise<FieldResponseDto> {
    const { type, options } = createFieldDto;
    const form = await this.formService.findFormById(formId);
    if (form.isPublished) {
      throw new BadRequestException('Form is published');
    }
    if (userId && form.creatorId !== userId) {
      throw new ForbiddenException('Forbidden resource');
    }
    if (!validateField(type, options)) {
      throw new NotFoundException(`Options is invalid for field type ${type}`);
    }

    const newField = this.fieldRepository.create({ ...createFieldDto, formId });
    const savedField = await this.fieldRepository.save(newField);
    return plainToInstance(FieldResponseDto, savedField);
  }

  async updateFieldById(
    formId: number,
    fieldId: number,
    updateFieldDto: UpdateFieldDto,
    userId?: number,
  ): Promise<FieldResponseDto> {
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId, formId },
    });
    if (!field) throw new NotFoundException('Field not found');

    const form = await this.formService.findFormById(field.formId);
    if (form.isPublished) {
      throw new BadRequestException('Form is published');
    }
    if (userId && form.creatorId !== userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    Object.assign(field, updateFieldDto);

    const { type, options } = field;
    if (!validateField(type, options)) {
      throw new NotFoundException(`Options is invalid for field type ${type}`);
    }

    const savedField = await this.fieldRepository.save(field);
    return plainToInstance(FieldResponseDto, savedField);
  }

  async deleteFieldById(
    formId: number,
    fieldId: number,
    userId?: number,
  ): Promise<void> {
    const field = await this.fieldRepository.findOne({
      where: { id: fieldId, formId },
    });
    if (!field) throw new NotFoundException('Field not found');

    const form = await this.formService.findFormById(field.formId);
    if (form.isPublished) {
      throw new BadRequestException('Form is published');
    }
    if (userId && form.creatorId !== userId) {
      throw new ForbiddenException('Forbidden resource');
    }

    await this.fieldRepository.delete(fieldId);
  }
}
