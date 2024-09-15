import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SortDto } from 'src/common/dto';
import { AuthProvidersEnum } from 'src/constants';
import { IPaginationOptions } from 'src/interfaces';
import { hashPassword } from 'src/utils/hash-password';
import { NullableType } from 'src/utils/types';
import {
  CreateUserDto,
  FilterUserDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}

  async findById(id: number): Promise<UserResponseDto> {
    const foundUser = await this.usersRepository.findById(id);

    if (!foundUser) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, foundUser);
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
    const foundUser = await this.usersRepository.findByEmail(email);

    if (!foundUser) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, foundUser);
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email } = createUserDto;
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    if (createUserDto.password) {
      createUserDto.password = await hashPassword(createUserDto.password);
    }
    const newUser = this.usersRepository.create(createUserDto);
    return plainToInstance(UserResponseDto, newUser);
  }

  async updateById(id: number, data: UpdateUserDto): Promise<UserResponseDto> {
    const foundUser = await this.usersRepository.findById(id);

    if (!foundUser) throw new NotFoundException('User not found');

    const updatedUser = await this.usersRepository.update(id, data);
    return plainToInstance(UserResponseDto, updatedUser);
  }

  async deleteById(id: number) {
    const foundUser = await this.usersRepository.findById(id);
    if (!foundUser) throw new NotFoundException('User not found');

    return this.usersRepository.deleteById(id);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<[UserResponseDto[], number]> {
    const [result, total] = await this.usersRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
    return [plainToInstance(UserResponseDto, result), total];
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: string;
    provider: AuthProvidersEnum;
  }): Promise<NullableType<UserResponseDto>> {
    const user = await this.usersRepository.findBySocialIdAndProvider({
      socialId,
      provider,
    });
    return plainToInstance(UserResponseDto, user);
  }
}
