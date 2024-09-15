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
import { EFormTypeScope, EUserStatus, USER_CACHE_PREFIX } from 'src/constants';
import { hashPassword } from 'src/utils/hash-password';
import { paginateData } from 'src/utils/paginate-data';
import { NullableType } from 'src/utils/types';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { DepartmentsService } from '../departments/departments.service';
import { FilesService } from '../files/files.service';
import { RedisService } from '../redis/redis.service';
import { RolesService } from '../roles/roles.service';
import {
  CreateUserDto,
  QueryUserDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserItemDto,
  UserResponseDto,
} from './dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => DepartmentsService))
    private readonly departmentService: DepartmentsService,
    private readonly rolesService: RolesService,
    private readonly filesService: FilesService,
    private readonly redisService: RedisService,
  ) {}

  canSubmitForm(user: UserResponseDto, scope: EFormTypeScope): boolean {
    const { isOfficial } = user;
    switch (scope) {
      case EFormTypeScope.PROBATION:
        return !isOfficial;
      case EFormTypeScope.PERMANENT:
        return isOfficial;
      case EFormTypeScope.ALL:
        return true;
      default:
        return false;
    }
  }

  async getAllUserIds(isOfficial?: boolean): Promise<number[]> {
    const users = await this.userRepository.find({
      where: isOfficial !== undefined ? { isOfficial } : {},
      select: ['id'],
    });

    return users.map((user) => user.id);
  }

  async findOneUserBy(
    where: {
      id?: number;
      email?: string;
      isOfficial?: boolean;
      status?: EUserStatus;
    },
    select: (keyof User)[] = [],
  ): Promise<UserResponseDto> {
    const options: FindOneOptions<User> = { where };
    if (select.length > 0) options.select = select;
    const foundUser = await this.userRepository.findOne(options);
    if (!foundUser) throw new NotFoundException('User not found');
    return plainToInstance(UserResponseDto, foundUser);
  }

  async findEmailToSendNotifications(scope: EFormTypeScope): Promise<string[]> {
    const whereCondition: FindOptionsWhere<User> = {
      status: EUserStatus.ACTIVE,
    };

    if (scope === EFormTypeScope.PROBATION) {
      whereCondition.isOfficial = false;
    } else if (scope === EFormTypeScope.PERMANENT) {
      whereCondition.isOfficial = true;
    }

    const employees = await this.userRepository.find({
      where: whereCondition,
      select: ['email'],
    });

    return employees.map((employee) => employee.email);
  }

  async listAllUsers(
    query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    const { page, size, departmentId, search, status } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', {
        status,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .select(['user.id', 'user.code', 'user.firstname', 'user.lastname'])
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return paginateData(plainToInstance(UserItemDto, users), page, size, total);
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, roleId, departmentId } = createUserDto;
    const foundUser = await this.userRepository.findOne({
      where: { email },
    });
    if (foundUser) throw new BadRequestException('User already exists');

    const existsRole = await this.rolesService.checkExists(roleId);
    if (!existsRole) throw new NotFoundException('Role not found');

    if (departmentId) {
      const existsDepartment =
        await this.departmentService.checkExists(departmentId);
      if (!existsDepartment)
        throw new NotFoundException('Department not found');
    }

    createUserDto.password = await hashPassword(createUserDto.password);
    const newUser = this.userRepository.create(createUserDto);
    const user = await this.userRepository.save(newUser);
    const year = new Date().getFullYear();
    user.code = `${year}${user.id.toString().padStart(5, '0')}`;
    const savedUser = await this.userRepository.save(user);
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${savedUser.id}`);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async updateProfileById(
    id: number,
    data: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const foundUser = await this.findUserByIdWithCache(id);
    if (!foundUser) throw new NotFoundException('User not found');

    if (data.avatar && foundUser.avatar) {
      await this.filesService.deleteFile(foundUser.avatar);
    }

    await this.userRepository.update(id, data);
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${id}`);
    const savedUser = await this.findUserByIdWithCache(id);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async adminUpdateUserById(
    id: number,
    data: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const foundUser = await this.findUserByIdWithCache(id);
    if (!foundUser) throw new NotFoundException('User not found');
    const { password, roleId, departmentId } = data;

    if (password) {
      data.password = await hashPassword(data.password);
    }

    if (data.avatar && foundUser.avatar) {
      await this.filesService.deleteFile(foundUser.avatar);
    }

    if (roleId) {
      const foundRole = await this.rolesService.checkExists(data.roleId);
      if (!foundRole) throw new NotFoundException('Role not found');
    }

    if (departmentId) {
      const department = await this.departmentService.checkExists(departmentId);
      if (!department) throw new NotFoundException('Department not found');
    }

    if (file) {
      if (foundUser.avatar) {
        await this.filesService.deleteFile(foundUser.avatar);
      }
      foundUser.avatar = await this.filesService.uploadFile(file);
    }

    await this.userRepository.update(id, data);
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${id}`);
    const savedUser = await this.findUserByIdWithCache(id);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async listDepartmentEmployees(
    departmentId: number,
    query: QueryUserDto,
    user?: User,
  ) {
    const department =
      await this.departmentService.findDepartmentById(departmentId);

    if (
      user &&
      user.id !== department.directorId &&
      user.id !== department.managerId
    ) {
      throw new ForbiddenException('Forbidden resource');
    }

    const { page, size, search } = query;
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.andWhere('user.departmentId = :departmentId', {
      departmentId,
    });
    queryBuilder.andWhere('user.status = :status', {
      status: EUserStatus.ACTIVE,
    });
    queryBuilder.andWhere('user.id NOT IN (:...excludedIds)', {
      excludedIds: [department.managerId, department.directorId].filter(
        Boolean,
      ),
    });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .select(['user.id', 'user.code', 'user.firstname', 'user.lastname'])
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return paginateData(plainToInstance(UserItemDto, users), page, size, total);
  }

  async findUserByIdWithCache(
    userId: number,
  ): Promise<NullableType<UserResponseDto>> {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    const cacheValue = await this.redisService.getKey(cacheKey);
    if (cacheValue) return JSON.parse(cacheValue);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department'],
    });

    const userResponse = user ? plainToInstance(UserResponseDto, user) : null;
    await this.redisService.setWithExpiration(
      cacheKey,
      JSON.stringify(userResponse),
      28800,
    );

    return plainToInstance(UserResponseDto, userResponse);
  }

  async managerFindUserById(
    departmentId: number,
    employeeId: number,
    userId: number,
  ): Promise<UserResponseDto> {
    const user = await this.findUserByIdWithCache(employeeId);
    if (!user) throw new NotFoundException('User not found');
    if (user.departmentId === departmentId) {
      throw new NotFoundException('Department not found');
    }
    if (
      user.department.managerId !== userId &&
      user.department.directorId !== userId
    ) {
      throw new ForbiddenException('Forbidden resource');
    }
    return plainToInstance(UserResponseDto, user);
  }

  async toggleUserStatus(employeeId, userId: number): Promise<void> {
    if (employeeId === userId) {
      throw new BadRequestException('You can not toggle your status');
    }
    const user = await this.findUserByIdWithCache(employeeId);
    if (!user) throw new NotFoundException('User not found');

    user.status =
      user.status === EUserStatus.ACTIVE
        ? EUserStatus.ARCHIVED
        : EUserStatus.ACTIVE;

    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${employeeId}`);
    await this.userRepository.save(user);
  }

  async promoteToOfficial(employeeId: number, userId?: number): Promise<void> {
    const employee = await this.findUserByIdWithCache(employeeId);
    if (!employee) throw new NotFoundException('User not found');
    if (
      userId &&
      userId !== employee.department.managerId &&
      userId !== employee.department.directorId
    ) {
      throw new ForbiddenException('Forbidden resource');
    }

    employee.isOfficial = true;
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${employeeId}`);
    await this.userRepository.save(employee);
  }
}
