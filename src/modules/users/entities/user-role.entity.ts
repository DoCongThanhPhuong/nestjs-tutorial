import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity('user_role')
export class UserRole {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  role_id: number;

  @ManyToOne(() => User, (user) => user.roles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
