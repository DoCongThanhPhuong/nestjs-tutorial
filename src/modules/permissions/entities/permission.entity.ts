import { ACL } from 'src/modules/acl/entities/acl.entity';
import { RolePermission } from 'src/modules/roles/entities/role-permisssion.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({
    name: 'permission_id',
  })
  id: number;

  @Column({ name: 'permission_name' })
  name: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  roles: RolePermission[];

  @OneToMany(() => ACL, (acl) => acl.permission)
  acl: ACL[];
}
