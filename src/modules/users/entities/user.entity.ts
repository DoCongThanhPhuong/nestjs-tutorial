import { BaseEntity } from 'src/common/mysql/base.entity';
import { AuthProvidersEnum } from 'src/constants';
import { ACL } from 'src/modules/acl/entities/acl.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_id',
  })
  id: number;

  @Column({
    name: 'user_fullname',
    default: null,
  })
  fullName: string;

  @Column({
    name: 'user_password',
    nullable: false,
  })
  password: string;

  @Column({
    name: 'user_email',
    nullable: false,
  })
  email: string;

  @Column({
    name: 'user_phone',
    default: null,
  })
  phone: string;

  @Column({
    name: 'user_provider',
    type: 'enum',
    enum: AuthProvidersEnum,
    default: AuthProvidersEnum.EMAIL,
  })
  provider: AuthProvidersEnum;

  @Column({ name: 'user_social_id', type: String, nullable: true })
  socialId: string;

  @Column({
    name: 'is_active',
    default: false,
  })
  isActive: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  roles: UserRole[];

  @OneToMany(() => ACL, (acl) => acl.user)
  acl: ACL[];
}
