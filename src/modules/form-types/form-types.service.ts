import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hasChildEntities } from 'src/utils/has-children';
import { Repository } from 'typeorm';
import { CreateFormTypeDto, UpdateFormTypeDto } from './dto';
import { FormType } from './entities/form-type.entity';

@Injectable()
export class FormTypesService {
  constructor(
    @InjectRepository(FormType)
    private readonly formTypeRepository: Repository<FormType>,
  ) {}
  async create(createFormTypeDto: CreateFormTypeDto): Promise<FormType> {
    const formType = this.formTypeRepository.create(createFormTypeDto);
    return this.formTypeRepository.save(formType);
  }

  async findAll(): Promise<FormType[]> {
    return this.formTypeRepository.find();
  }

  findOne(id: number) {
    const formType = this.formTypeRepository.findOne({ where: { id } });
    if (!formType) throw new NotFoundException(`Form type not found`);

    return formType;
  }

  async update(
    id: number,
    updateFormTypeDto: UpdateFormTypeDto,
  ): Promise<FormType> {
    const formType = await this.formTypeRepository.preload({
      id,
      ...updateFormTypeDto,
    });

    if (!formType) throw new NotFoundException(`Form type not found`);

    return this.formTypeRepository.save(formType);
  }

  async remove(id: number) {
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
