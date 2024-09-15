import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ROLE_CACHE_PREFIX } from 'src/constants';
import { hasChildEntities } from 'src/utils/has-children-entities';
import { NullableType } from 'src/utils/types';
import { DataSource, Repository } from 'typeorm';
import { PermissionResponseDto } from '../permissions/dto';
import { PermissionsService } from '../permissions/permissions.service';
import { RedisService } from '../redis/redis.service';
import {
  CreateRoleDto,
  RoleItemDto,
  RoleResponseDto,
  UpdateRoleDto,
} from './dto';
import { RolePermission } from './entities/role-permisssion.entity';
import { Role } from './entities/role.entity';

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

      if (existingPermissions?.length !== permissionIds?.length) {
        throw new BadRequestException('Invalid permissions');
      }

      const role = queryRunner.manager.create(Role, { name, description });
      const savedRole = await queryRunner.manager.save(Role, role);

      const rolePermissions = existingPermissions.map((permission) => ({
        roleId: savedRole.id,
        permissionId: permission.id,
      }));
      await queryRunner.manager.save(RolePermission, rolePermissions);

      await this.redisService.deleteKey(`${ROLE_CACHE_PREFIX}${savedRole.id}`);
      await queryRunner.commitTransaction();

      return plainToInstance(RoleResponseDto, savedRole);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findRoleByIdWithCache(
    roleId: number,
  ): Promise<NullableType<RoleResponseDto>> {
    const cacheKey = `${ROLE_CACHE_PREFIX}${roleId}`;
    const cacheValue = await this.redisService.getKey(cacheKey);
    if (cacheValue) return JSON.parse(cacheValue);
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    const permissions = await this.listPermissionsOfRole(roleId);
    const roleResponse = role
      ? plainToInstance(RoleResponseDto, { ...role, permissions })
      : null;

    await this.redisService.setWithExpiration(
      cacheKey,
      JSON.stringify(roleResponse),
      28800,
    );

    return roleResponse;
  }

  async listAllRoles(): Promise<RoleItemDto[]> {
    const roles = await this.roleRepository.find();
    return plainToInstance(RoleItemDto, roles);
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
        relations: ['rolePermissions'],
      });
      if (!role) throw new NotFoundException('Role not found');

      if (name && name !== role.name) {
        const existingRoleWithName = await queryRunner.manager.findOne(Role, {
          where: { name },
        });
        if (existingRoleWithName) {
          throw new BadRequestException('Role name already exists');
        }
        role.name = name;
      }
      if (description) role.description = description;
      await queryRunner.manager.save(Role, role);

      if (permissionIds) {
        const existingPermissions =
          await this.permissionsService.findPermissionsByIds(permissionIds);
        if (existingPermissions.length !== permissionIds.length) {
          throw new BadRequestException('Some permissions do not exist');
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
      await this.redisService.deleteKey(`${ROLE_CACHE_PREFIX}${roleId}`);
      await queryRunner.commitTransaction();
      const savedRole = await this.findRoleByIdWithCache(roleId);
      return plainToInstance(RoleResponseDto, savedRole);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRole(roleId: number): Promise<void> {
    const foundRole = await this.findRoleByIdWithCache(roleId);
    if (!foundRole) throw new NotFoundException('Role not found');

    const isUnable = await hasChildEntities(
      this.roleRepository,
      roleId,
      'users',
    );
    if (isUnable) throw new BadRequestException('Unable to delete role');

    await this.redisService.deleteKey(`${ROLE_CACHE_PREFIX}${roleId}`);
    await this.roleRepository.delete(roleId);
  }
}
