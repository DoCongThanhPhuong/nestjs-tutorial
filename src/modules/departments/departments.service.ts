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
import { EUserStatus, USER_CACHE_PREFIX } from 'src/constants';
import { DataSource, Repository } from 'typeorm';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from './dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async checkExists(id: number): Promise<boolean> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      select: ['id'],
    });
    return department ? true : false;
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const { name } = createDepartmentDto;
    const department = await this.departmentRepository.findOne({
      where: { name },
      select: ['id'],
    });
    if (department) {
      throw new BadRequestException('Department name already exists');
    }

    const newDepartment = this.departmentRepository.create(createDepartmentDto);
    const savedDepartment = await this.departmentRepository.save(newDepartment);
    return plainToInstance(DepartmentResponseDto, savedDepartment);
  }

  async listAllDepartments(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.find();
    return plainToInstance(DepartmentResponseDto, departments);
  }

  async listManagedDepartments(
    userId: number,
  ): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.find({
      where: [{ directorId: userId }, { managerId: userId }],
    });
    return plainToInstance(DepartmentResponseDto, departments);
  }

  async findDepartmentById(
    id: number,
    userId?: number,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.director', 'director')
      .leftJoinAndSelect('department.manager', 'manager')
      .where('department.id = :id', { id })
      .getOne();

    if (!department) throw new NotFoundException('Department not found');
    if (
      userId &&
      userId !== department.directorId &&
      userId !== department.managerId
    ) {
      throw new ForbiddenException('Forbidden resource');
    }

    return plainToInstance(DepartmentResponseDto, department);
  }

  async updateDepartmentById(
    departmentId: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository
      .createQueryBuilder('department')
      .leftJoin('department.users', 'user')
      .leftJoin('department.director', 'director')
      .leftJoin('department.manager', 'manager')
      .select(['department.id', 'user.id', 'director.id', 'manager.id'])
      .where('department.id = :departmentId', { departmentId })
      .getOne();
    if (!department) throw new NotFoundException('Department not found');

    const userIds = department?.users.map((e) => e.id);
    const deleteCacheUserIds = [...userIds, department.directorId];

    const { managerId, directorId } = updateDepartmentDto;
    if (managerId && managerId !== department.managerId) {
      const manager = await this.userService.findOneUserBy(
        {
          id: managerId,
          status: EUserStatus.ACTIVE,
        },
        ['id', 'departmentId'],
      );
      if (manager.departmentId !== departmentId) {
        throw new BadRequestException('Manager must be employee of department');
      }
      deleteCacheUserIds.push(managerId);
    }

    if (directorId && directorId !== department.directorId) {
      const director = await this.userService.findOneUserBy(
        {
          id: directorId,
          status: EUserStatus.ACTIVE,
        },
        ['id'],
      );
      deleteCacheUserIds.push(director.id);
    }
    const cacheKeys = deleteCacheUserIds.map(
      (userId) => `${USER_CACHE_PREFIX}${userId}`,
    );
    if (cacheKeys.length > 0) {
      await this.redisService.deleteManyKeys(cacheKeys);
    }
    await this.departmentRepository.update(departmentId, updateDepartmentDto);
    const savedDepartment = await this.findDepartmentById(departmentId);
    return plainToInstance(DepartmentResponseDto, savedDepartment);
  }

  async deleteDepartmentById(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cacheKeys = await queryRunner.manager
        .createQueryBuilder(User, 'user')
        .select('user.id')
        .where('user.departmentId = :id', { id })
        .getMany()
        .then((users) => users.map((user) => `${USER_CACHE_PREFIX}${user.id}`));

      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ departmentId: null })
        .where('departmentId = :id', { id })
        .execute();

      await queryRunner.manager.delete(Department, id);
      if (cacheKeys.length > 0) {
        await this.redisService.deleteManyKeys(cacheKeys);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
