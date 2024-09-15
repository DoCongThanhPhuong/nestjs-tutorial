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
  CreatePermissionDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from './dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findPermissionsByIds(
    perIds: number[],
  ): Promise<PermissionResponseDto[]> {
    const existingPermissions =
      await this.permissionRepository.findByIds(perIds);
    return plainToInstance(PermissionResponseDto, existingPermissions);
  }

  async listAllPermissions(): Promise<PermissionResponseDto[]> {
    const permissions = await this.permissionRepository.find();
    return plainToInstance(PermissionResponseDto, permissions);
  }

  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const { name, method, path } = createPermissionDto;

    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });
    if (existingPermission) {
      throw new BadRequestException('Permission name already exists');
    }

    const permission = this.permissionRepository.create({
      name,
      method,
      path,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    return plainToInstance(PermissionResponseDto, savedPermission);
  }

  async updatePermission(
    permId: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permId },
    });
    if (!permission) throw new NotFoundException('Permission not found');

    const isUnable = await hasChildEntities(
      this.permissionRepository,
      permId,
      'rolePermissions',
    );
    if (isUnable) throw new BadRequestException('Unable to update permission');

    const { name, method, path } = updatePermissionDto;

    if (name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name },
      });

      if (existingPermission && existingPermission.id !== permId) {
        throw new BadRequestException('Permission name already exists');
      }
    }

    permission.name = name || permission.name;
    permission.method = method || permission.method;
    permission.path = path || permission.path;
    const savedPermission = await this.permissionRepository.save(permission);

    return plainToInstance(PermissionResponseDto, savedPermission);
  }

  async deletePermission(permId: number): Promise<void> {
    const perm = await this.permissionRepository.findOne({
      where: { id: permId },
    });
    if (!perm) throw new NotFoundException('Permission not found');

    const isUnable = await hasChildEntities(
      this.permissionRepository,
      permId,
      'rolePermissions',
    );
    if (isUnable) throw new BadRequestException('Unable to delete permission');

    await this.permissionRepository.delete(permId);
  }
}
