import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ name: 'name', unique: true, nullable: false })
  name: string;

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  @Column({ name: 'manager_id', nullable: true })
  managerId: number;

  @Column({ name: 'director_id', nullable: true })
  directorId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'director_id' })
  director: User;
}
