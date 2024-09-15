import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { Resource } from 'src/modules/resources/entities/resource.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ACLs')
export class ACL {
  @PrimaryGeneratedColumn({ name: 'acl_id' })
  id: number;

  @ManyToOne(() => Resource, (resource) => resource.acl)
  @JoinColumn({ name: 'resource_id' })
  objectType: Resource;

  @ManyToOne(() => User, (user) => user.acl)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.acl)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.acl)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
