import { EMethod } from 'src/constants';
import { RolePermission } from 'src/modules/roles/entities/role-permisssion.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name', unique: true, nullable: false })
  name: string;

  @Column({
    name: 'method',
    type: 'enum',
    enum: EMethod,
    nullable: false,
  })
  method: EMethod;

  @Column({ name: 'path', nullable: false })
  path: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
