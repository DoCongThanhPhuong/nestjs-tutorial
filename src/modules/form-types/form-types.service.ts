import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { hasChildEntities } from 'src/utils/has-children-entities';
import { Repository } from 'typeorm';
import {
  CreateFormTypeDto,
  FormTypeResponseDto,
  UpdateFormTypeDto,
} from './dto';
import { FormType } from './entities/form-type.entity';

@Injectable()
export class FormTypesService {
  constructor(
    @InjectRepository(FormType)
    private readonly formTypeRepository: Repository<FormType>,
  ) {}
  async create(
    createFormTypeDto: CreateFormTypeDto,
  ): Promise<FormTypeResponseDto> {
    const { name } = createFormTypeDto;

    const existingFormType = await this.formTypeRepository.findOne({
      where: { name },
    });
    if (existingFormType) {
      throw new BadRequestException('Form type name already exists');
    }

    const formType = this.formTypeRepository.create(createFormTypeDto);
    const savedFormType = await this.formTypeRepository.save(formType);
    return plainToInstance(FormTypeResponseDto, savedFormType);
  }

  async findAll(): Promise<FormTypeResponseDto[]> {
    const formTypes = await this.formTypeRepository.find();
    return plainToInstance(FormTypeResponseDto, formTypes);
  }

  async findOne(id: number): Promise<FormTypeResponseDto> {
    const formType = await this.formTypeRepository.findOne({ where: { id } });
    if (!formType) throw new NotFoundException('Form type not found');
    return plainToInstance(FormTypeResponseDto, formType);
  }

  async update(
    id: number,
    updateFormTypeDto: UpdateFormTypeDto,
  ): Promise<FormTypeResponseDto> {
    const { name } = updateFormTypeDto;
    const isUnable = await hasChildEntities(
      this.formTypeRepository,
      id,
      'forms',
    );
    if (isUnable) throw new BadRequestException('Unable to update form type');
    if (name) {
      const existingFormType = await this.formTypeRepository.findOne({
        where: { name },
      });
      if (existingFormType && existingFormType.id !== id) {
        throw new BadRequestException('Form type name already exists');
      }
    }

    const formType = await this.formTypeRepository.preload({
      id,
      ...updateFormTypeDto,
    });

    if (!formType) throw new NotFoundException('Form type not found');

    const savedFormType = this.formTypeRepository.save(formType);
    return plainToInstance(FormTypeResponseDto, savedFormType);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const isUnable = await hasChildEntities(
      this.formTypeRepository,
      id,
      'forms',
    );

    if (isUnable) throw new BadRequestException('Unable to delete form type');
    await this.formTypeRepository.delete(id);
  }
}
