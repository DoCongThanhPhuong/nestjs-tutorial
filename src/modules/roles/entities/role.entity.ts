import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RolePermission } from './role-permisssion.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name', unique: true, nullable: false })
  name: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  rolePermissions: RolePermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
