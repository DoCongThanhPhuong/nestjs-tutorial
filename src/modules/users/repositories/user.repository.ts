import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SortDto } from 'src/common/dto';
import { AuthProvidersEnum } from 'src/constants';
import { IPaginationOptions } from 'src/interfaces';
import { NullableType } from 'src/utils/types';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto, FilterUserDto, UpdateUserDto } from '../dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    return savedUser;
  }

  async findById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, user: UpdateUserDto): Promise<User> {
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({
        ...user,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
    return this.usersRepository.findOne({ where: { id } });
  }

  async deleteById(id: number): Promise<UpdateResult> {
    return this.usersRepository.softDelete(id);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<[User[], number]> {
    const where: FindOptionsWhere<User> = {};
    if (filterOptions) {
      where.isActive = filterOptions.isActive;
    }
    const entities = await this.usersRepository.findAndCount({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });
    return entities;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: AuthProvidersEnum;
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const entity = await this.usersRepository.findOne({
      where: { socialId, provider },
    });

    return entity;
  }
}
