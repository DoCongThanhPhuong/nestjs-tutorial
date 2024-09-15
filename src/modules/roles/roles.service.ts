import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { RoleRepository } from './repositories/role.repository';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RoleRepository) {}

  async getRolesByUserId(userId: number): Promise<Role[]> {
    return this.rolesRepository.getRolesByUserId(userId);
  }
}
