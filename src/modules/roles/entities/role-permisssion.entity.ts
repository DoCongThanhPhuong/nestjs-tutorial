import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Role } from './role.entity';

@Entity('role_permission')
export class RolePermission {
  @PrimaryColumn()
  role_id: number;

  @PrimaryColumn()
  permission_id: number;

  @ManyToOne(() => Role, (role) => role.permissions)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.roles)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
