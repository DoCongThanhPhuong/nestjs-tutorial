import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from './role-permisssion.entity';
import { UserRole } from 'src/modules/users/entities/user-role.entity';
import { ACL } from 'src/modules/acl/entities/acl.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn({
    name: 'role_id',
  })
  id: number;

  @Column({ name: 'role_name' })
  name: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  permissions: RolePermission[];

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  users: UserRole[];

  @OneToMany(() => ACL, (acl) => acl.user)
  acl: ACL[];
}
