import {
  BadRequestException,
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
import { UserResponseDto } from '../users/dto';
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

  async checkExistsName(name: string): Promise<boolean> {
    const department = await this.departmentRepository.findOne({
      where: { name },
      select: ['id'],
    });
    return department ? true : false;
  }

  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const { name } = createDepartmentDto;
    const department = await this.checkExistsName(name);
    if (department) {
      throw new BadRequestException('Name or prefix already exists');
    }
    const newDepartment = this.departmentRepository.create(createDepartmentDto);
    const savedDepartment = await this.departmentRepository.save(newDepartment);
    return plainToInstance(DepartmentResponseDto, savedDepartment);
  }

  async listAllDepartments(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepository.find();
    return plainToInstance(DepartmentResponseDto, departments);
  }

  async listDepartments(user: UserResponseDto) {
    if (user.departmentsManaged?.length > 0) return user.departmentsManaged;
    return [user.department];
  }

  async findDepartmentById(
    id: number,
    userId?: number,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['director', 'manager'],
    });
    if (!department) throw new NotFoundException('Department not found');
    if (userId && userId !== department.directorId) {
      throw new BadRequestException('Unable to access');
    }

    return plainToInstance(DepartmentResponseDto, department);
  }

  async updateDepartmentById(
    departmentId: number,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['users', 'director', 'manager'],
    });
    if (!department) throw new NotFoundException('Department not found');
    const userIds = department?.users.map((e) => e.id);
    const deleteCacheUserIds = [...userIds, department.directorId];

    const { managerId, directorId } = updateDepartmentDto;

    if (managerId && managerId !== department.managerId) {
      const manager = await this.userService.findOneUserBy({
        id: managerId,
        status: EUserStatus.ACTIVE,
      });
      if (!manager) throw new NotFoundException('User not found');
      if (manager.departmentId !== departmentId) {
        throw new BadRequestException('User is not in this department');
      }
      deleteCacheUserIds.push(managerId);
    }

    if (directorId && directorId !== department.directorId) {
      const director = await this.userService.findOneUserBy({
        id: directorId,
        status: EUserStatus.ACTIVE,
      });
      if (!director) throw new NotFoundException('User not found');
      deleteCacheUserIds.push(directorId);
    }
    const cacheKeys = deleteCacheUserIds.map(
      (userId) => `${USER_CACHE_PREFIX}${userId}`,
    );
    if (cacheKeys.length > 0) {
      await this.redisService.deleteManyKeys(cacheKeys);
    }
    const savedDepartment = await this.departmentRepository.update(
      departmentId,
      updateDepartmentDto,
    );

    return plainToInstance(DepartmentResponseDto, savedDepartment);
  }

  async deleteDepartmentById(id: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager
        .createQueryBuilder()
        .update(User)
        .set({ departmentId: null })
        .where('departmentId = :id', { id })
        .execute();

      await queryRunner.manager.delete(Department, id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
