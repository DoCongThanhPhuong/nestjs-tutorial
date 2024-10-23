import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { hasChildEntities } from 'src/utils/has-children';
import { DataSource, Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { CreateRoleDto, RoleResponseDto, UpdateRoleDto } from './dto';
import { RolePermission } from './entities/role-permisssion.entity';
import { Role } from './entities/role.entity';
import { PermissionResponseDto } from '../permissions/dto';
import { USER_CACHE_PREFIX } from 'src/constants';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    private readonly permissionsService: PermissionsService,
    private readonly redisService: RedisService,
  ) {}

  async checkExists(id: number): Promise<boolean> {
    const foundRole = await this.roleRepository.findOne({
      where: { id },
      select: ['id'],
    });
    return foundRole ? true : false;
  }

  async listPermissionsOfRole(
    roleId: number,
  ): Promise<PermissionResponseDto[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
    });

    const permissions = rolePermissions.map((rp) => rp.permission);
    return plainToInstance(PermissionResponseDto, permissions);
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { name, description, permissionIds = [] } = createRoleDto;

      const existingRole = await queryRunner.manager.findOne(Role, {
        where: { name },
      });

      if (existingRole) throw new BadRequestException('Role already exists');

      const existingPermissions =
        await this.permissionsService.findPermissionsByIds(permissionIds);

      if (existingPermissions?.length !== permissionIds?.length)
        throw new BadRequestException('Invalid permissions');

      const role = queryRunner.manager.create(Role, { name, description });
      const savedRole = await queryRunner.manager.save(Role, role);

      const rolePermissions = existingPermissions.map((permission) => ({
        roleId: savedRole.id,
        permissionId: permission.id,
      }));

      await queryRunner.manager.save(RolePermission, rolePermissions);
      await queryRunner.commitTransaction();

      return plainToInstance(RoleResponseDto, savedRole);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findRoleById(id: number): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    const permissions = await this.listPermissionsOfRole(id);
    if (!role) throw new NotFoundException('Role not found');

    return plainToInstance(RoleResponseDto, { ...role, permissions });
  }

  async listAllRoles() {
    const roles = await this.roleRepository.find();
    return plainToInstance(RoleResponseDto, roles);
  }

  async updateRole(
    roleId: number,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { name, description, permissionIds = [] } = updateRoleDto;
      const role = await queryRunner.manager.findOne(Role, {
        where: { id: roleId },
        relations: ['rolePermissions', 'users'],
      });
      if (!role) throw new NotFoundException('Role not found');

      if (name && name !== role.name) {
        const existingRoleWithName = await queryRunner.manager.findOne(Role, {
          where: { name },
        });
        if (existingRoleWithName)
          throw new BadRequestException('Role name already exists');
        role.name = name;
      }
      if (description) role.description = description;
      await queryRunner.manager.save(Role, role);

      if (permissionIds) {
        const existingPermissions =
          await this.permissionsService.findPermissionsByIds(permissionIds);
        if (existingPermissions.length !== permissionIds.length) {
          throw new BadRequestException('One or more permissions do not exist');
        }
        await queryRunner.manager.delete(RolePermission, { roleId });
        if (permissionIds.length > 0) {
          const newRolePermissions = existingPermissions.map((permission) => ({
            roleId: role.id,
            permissionId: permission.id,
          }));
          await queryRunner.manager.save(RolePermission, newRolePermissions);
        }
      }
      const cacheKeys = role.users.map(
        (user) => `${USER_CACHE_PREFIX}${user.id}`,
      );
      if (cacheKeys.length > 0) {
        await this.redisService.deleteManyKeys(cacheKeys);
      }
      await queryRunner.commitTransaction();
      const savedRole = await this.findRoleById(roleId);
      return plainToInstance(RoleResponseDto, savedRole);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRole(roleId: number): Promise<void> {
    await this.findRoleById(roleId);

    const isUnable = await hasChildEntities(
      this.roleRepository,
      roleId,
      'users',
    );

    if (isUnable) throw new BadRequestException('Unable to delete role');
    await this.roleRepository.delete(roleId);
  }
}
