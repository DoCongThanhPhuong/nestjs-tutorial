import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { PaginationResponseDto } from 'src/common/dto';
import { EFormTypeScope, EUserStatus, USER_CACHE_PREFIX } from 'src/constants';
import { hashPassword } from 'src/utils/hash-password';
import { paginateData } from 'src/utils/paginate-data';
import { FindOneOptions, Not, Repository } from 'typeorm';
import { DepartmentsService } from '../departments/departments.service';
import { RedisService } from '../redis/redis.service';
import { RolesService } from '../roles/roles.service';
import { UploadService } from '../upload/upload.service';
import {
  ChangePasswordDto,
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
    private readonly uploadService: UploadService,
    private readonly redisService: RedisService,
  ) {}

  async canSubmitForm(
    user: UserResponseDto,
    scope: EFormTypeScope,
  ): Promise<boolean> {
    const { isOfficial } = user;

    if (scope === EFormTypeScope.PROBATION && !isOfficial) return true;

    if (scope === EFormTypeScope.PERMANENT && isOfficial) return true;

    if (scope === EFormTypeScope.ALL) return true;

    return false;
  }

  async getAllUserIds(isOfficial?: boolean) {
    if (isOfficial)
      return this.userRepository.find({
        where: { isOfficial },
        select: ['id'],
      });
    return this.userRepository.find({ select: ['id'] });
  }

  async findOneUserBy(
    where: {
      id?: number;
      email?: string;
      isOfficial?: boolean;
      status?: EUserStatus;
    },
    relations: string[] = [],
    select: (keyof User)[] = [],
  ): Promise<UserResponseDto> {
    const options: FindOneOptions<User> = { where, relations };

    if (select.length > 0) {
      options.select = select;
    }

    const foundUser = await this.userRepository.findOne(options);

    if (!foundUser) throw new NotFoundException('User not found');

    return plainToInstance(UserResponseDto, foundUser);
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: number) {
    const { password, oldPassword } = changePasswordDto;
    const foundUser = await this.findOneUserBy({
      id: userId,
      status: EUserStatus.ACTIVE,
    });
    const isValidPassword = await bcrypt.compare(
      oldPassword,
      foundUser.password,
    );
    if (!isValidPassword)
      throw new BadRequestException('Old password is incorrect');
    const updatedUser = await this.updateProfileById(userId, {
      password,
    });
    return plainToInstance(UserResponseDto, updatedUser);
  }

  async findEmailToSendNotifications(
    scope: EFormTypeScope,
    creatorId: number,
  ): Promise<string[]> {
    const whereCondition: any = {
      id: Not(creatorId),
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
    const { page, size, departmentId, search } = query;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', {
        departmentId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .select(['user.code', 'user.firstname', 'user.lastname', 'user.email'])
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
    if (!existsRole) throw new BadRequestException('Role not found');

    if (departmentId) {
      const existsDepartment =
        await this.departmentService.checkExists(departmentId);
      if (!existsDepartment)
        throw new BadRequestException('Department not found');
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
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const foundUser = await this.findUserByIdWithCache(id);
    if (!foundUser) throw new NotFoundException('User not found');
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    if (file) {
      if (foundUser.avatar) {
        await this.uploadService.deleteFile(foundUser.avatar);
      }
      foundUser.avatar = await this.uploadService.uploadFile(file);
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
        await this.uploadService.deleteFile(foundUser.avatar);
      }
      foundUser.avatar = await this.uploadService.uploadFile(file);
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
      throw new BadRequestException('You do not have permission');
    }

    const { page, size, search } = query;
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.andWhere('user.departmentId = :departmentId', {
      departmentId,
    });

    if (search) {
      queryBuilder.andWhere(
        '(user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await queryBuilder
      .select(['user.code', 'user.firstname', 'user.lastname', 'user.email'])
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    return paginateData(plainToInstance(UserItemDto, users), page, size, total);
  }

  async findUserByIdWithCache(userId: number) {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    const cacheValue = await this.redisService.getKey(cacheKey);

    if (cacheValue) return JSON.parse(cacheValue);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department', 'managedDepartment', 'departmentsManaged'],
    });
    const role = await this.rolesService.findRoleById(user.roleId);

    const userResponse = user
      ? plainToInstance(UserResponseDto, { ...user, role })
      : null;

    await this.redisService.setWithExpiration(
      cacheKey,
      JSON.stringify(userResponse),
      86400,
    );

    return userResponse;
  }

  async managerFindUserById(
    departmentId: number,
    employeeId: number,
    userId: number,
  ) {
    const user = await this.findUserByIdWithCache(employeeId);
    if (!user) throw new NotFoundException('User not found');
    if (user.departmentId === departmentId) {
      throw new NotFoundException('Department not found');
    }
    if (
      user.department.managerId !== userId &&
      user.department.directorId !== userId
    ) {
      throw new ForbiddenException('Unauthorized access');
    }
    return plainToInstance(UserResponseDto, user);
  }

  async toggleUserStatus(employeeId, userId: number): Promise<void> {
    if (employeeId === userId) {
      throw new BadRequestException('You can not toggle your status');
    }
    const user = await this.findUserByIdWithCache(employeeId);

    if (!user) throw new NotFoundException('Employee not found');

    user.status =
      user.status === EUserStatus.ACTIVE
        ? EUserStatus.ARCHIVED
        : EUserStatus.ACTIVE;

    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${employeeId}`);
    await this.userRepository.save(user);
  }

  async promoteToOfficial(employeeId: number, userId?: number): Promise<void> {
    const employee = await this.findUserByIdWithCache(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');
    if (
      userId &&
      userId !== employee.department.managerId &&
      userId !== employee.department.directorId
    ) {
      throw new ForbiddenException('Unauthorized access');
    }

    employee.isOfficial = true;
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${employeeId}`);
    await this.userRepository.save(employee);
  }
}
