import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PermissionResponseDto, UpdatePermissionDto } from './dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
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
  ): Promise<Permission> {
    const { name, description, method, path } = createPermissionDto;

    const existingPermission = await this.permissionRepository.findOne({
      where: { name },
    });
    if (existingPermission) {
      throw new BadRequestException('Permission name already exists');
    }

    const permission = this.permissionRepository.create({
      name,
      description,
      method,
      path,
    });

    return await this.permissionRepository.save(permission);
  }

  async updatePermission(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    const { name, description, method, path } = updatePermissionDto;

    const existingPermission = await this.permissionRepository.findOneBy({
      name,
    });
    if (existingPermission && existingPermission.id !== id) {
      throw new BadRequestException('Permission name already exists');
    }

    permission.name = name || permission.name;
    permission.description = description || permission.description;
    permission.method = method || permission.method;
    permission.path = path || permission.path;
    const savedPermission = await this.permissionRepository.save(permission);
    return plainToInstance(PermissionResponseDto, savedPermission);
  }

  async deletePermission(permId: number): Promise<void> {
    await this.permissionRepository.findOne({ where: { id: permId } });
    await this.permissionRepository.delete(permId);
  }
}
