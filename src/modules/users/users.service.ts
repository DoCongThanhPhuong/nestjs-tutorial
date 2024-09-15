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
import { FindOneOptions, FindOptionsWhere, Not, Repository } from 'typeorm';
import { DepartmentsService } from '../departments/departments.service';
import { RedisService } from '../redis/redis.service';
import { RolesService } from '../roles/roles.service';
import { UploadService } from '../upload/upload.service';
import {
  ChangePasswordDto,
  CreateUserDto,
  QueryUserDto,
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

  async getAllUserIds(isOfficial?: boolean): Promise<UserResponseDto[]> {
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

  async findManyUsersWithPagination(
    query: QueryUserDto,
  ): Promise<PaginationResponseDto<UserItemDto>> {
    const { page, size, departmentId } = query;
    const where: FindOptionsWhere<User> = {};
    if (departmentId) {
      where.departmentId = departmentId;
    }
    const [users, total] = await this.userRepository.findAndCount({
      select: ['code', 'firstname', 'lastname', 'email'],
      skip: (page - 1) * size,
      take: size,
      where: where,
      order: { id: 'DESC' },
    });

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
    const savedUser = await this.userRepository.save(newUser);
    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${savedUser.id}`);
    return plainToInstance(UserResponseDto, savedUser);
  }

  async updateProfileById(
    id: number,
    data: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const foundUser = await this.findUserByIdWithCache(id);
    if (!foundUser) throw new NotFoundException('User not found');
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    if (data.roleId) {
      const foundRole = await this.rolesService.checkExists(data.roleId);
      if (!foundRole) throw new NotFoundException('Role not found');
    }

    if (file) {
      if (foundUser.avatar) {
        await this.uploadService.deleteFile(foundUser.avatar);
      }

      foundUser.avatar = await this.uploadService.uploadFile(file);
    }

    const updatedUser = await this.userRepository.save({
      ...foundUser,
      ...data,
    });

    if (updatedUser.avatar) {
      updatedUser.avatar = await this.uploadService.getFileUrl(
        updatedUser.avatar,
      );
    }

    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${id}`);

    return plainToInstance(UserResponseDto, updatedUser);
  }

  async adminUpdateUserById(
    id: number,
    data: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserResponseDto> {
    const foundUser = await this.findUserByIdWithCache(id);
    if (!foundUser) throw new NotFoundException('User not found');

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    if (data.roleId) {
      const foundRole = await this.rolesService.checkExists(data.roleId);
      if (!foundRole) throw new NotFoundException('Role not found');
    }

    if (file) {
      if (foundUser.avatar)
        await this.uploadService.deleteFile(foundUser.avatar);

      foundUser.avatar = await this.uploadService.uploadFile(file);
    }

    const updatedUser = await this.userRepository.save({
      ...foundUser,
      ...data,
    });

    if (updatedUser.avatar) {
      updatedUser.avatar = await this.uploadService.getFileUrl(
        updatedUser.avatar,
      );
    }

    await this.redisService.deleteKey(`${USER_CACHE_PREFIX}${id}`);

    return plainToInstance(UserResponseDto, updatedUser);
  }

  // async getEmployees(
  //   managerId: number,
  //   isOfficial?: boolean,
  // ): Promise<UserResponseDto[]> {
  //   const manager = await this.userRepository
  //     .createQueryBuilder('user')
  //     .leftJoinAndSelect('user.managedDepartment', 'managedDepartment')
  //     .leftJoinAndSelect('managedDepartment.director', 'director')
  //     .leftJoinAndSelect('user.departmentsManaged', 'departmentsManaged')
  //     .leftJoinAndSelect('departmentsManaged.manager', 'manager')
  //     .where('user.id = :managerId', { managerId })
  //     .andWhere('user.status = :status', { status: EUserStatus.ACTIVE })
  //     .getOne();

  //   if (!manager) throw new NotFoundException('User not found');

  //   let result: User[] = [];
  //   const queryOptions: any = {};

  //   if (typeof isOfficial === 'boolean') {
  //     queryOptions.isOfficial = isOfficial;
  //   }

  //   if (manager.managedDepartment) {
  //     const directorId = manager.managedDepartment.director?.id;
  //     queryOptions.departmentId = manager.managedDepartment?.id;
  //     queryOptions.id = Not(In([manager.id, directorId]));
  //   } else if (
  //     manager.departmentsManaged &&
  //     manager.departmentsManaged?.length > 0
  //   ) {
  //     const managerIds = manager.departmentsManaged?.map((d) => d.manager?.id);
  //     queryOptions.id = In(managerIds);
  //   }
  //   result = await this.userRepository.find({ where: queryOptions });

  //   return plainToInstance(UserResponseDto, result);
  // }

  async listDepartmentEmployees(departmentId: number, user?: User) {
    let employees;
    const department =
      await this.departmentService.findDepartmentById(departmentId);

    if (
      user &&
      user.id !== department.directorId &&
      user.id !== department.managerId
    ) {
      throw new BadRequestException('You do not have permission');
    } else {
      employees = await this.userRepository.find({ where: { departmentId } });
    }

    return employees;
  }

  async findUserByIdWithCache(userId: number) {
    const cacheKey = `${USER_CACHE_PREFIX}${userId}`;
    const cacheValue = await this.redisService.getKey(cacheKey);

    if (cacheValue) return JSON.parse(cacheValue);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department', 'managedDepartment', 'departmentsManaged'],
    });

    const userResponse = user ? plainToInstance(UserResponseDto, user) : null;

    await this.redisService.setWithExpiration(
      cacheKey,
      JSON.stringify(userResponse),
      3000,
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
