import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { UserRole } from 'src/modules/users/entities/user-role.entity';

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  async getRolesByUserId(userId: number): Promise<Role[]> {
    return this.rolesRepository
      .createQueryBuilder('role')
      .innerJoin(UserRole, 'userRole', 'userRole.role_id = role.id')
      .where('userRole.user_id = :userId', { userId })
      .getMany();
  }
}
