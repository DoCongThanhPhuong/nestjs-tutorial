import { EGender, EUserStatus } from 'src/constants';
import { Department } from 'src/modules/departments/entities/department.entity';
import { Form } from 'src/modules/forms/entities/form.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Submission } from 'src/modules/submissions/entities/submission.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ name: 'code', unique: true, default: null })
  code: string;

  @Column({ name: 'firstname', nullable: false })
  firstname: string;

  @Column({ name: 'lastname', nullable: false })
  lastname: string;

  @Column({ name: 'email', unique: true, nullable: false })
  email: string;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'phone', default: null })
  phone: string;

  @Column({ name: 'avatar', default: null })
  avatar: string;

  @Column({ name: 'gender', type: 'enum', enum: EGender, nullable: false })
  gender: string;

  @Column({ name: 'birthday', default: null })
  birthday: Date;

  @Column({ name: 'hicn', default: null })
  hicn: string;

  @Column({ name: 'address', default: null })
  address: string;

  @Column({ name: 'citizen_id', default: null })
  citizenId: string;

  @Column({ name: 'job_title', default: null })
  jobTitle: string;

  @Column({ name: 'is_official', default: false })
  isOfficial: boolean;

  @Column({ name: 'department_id', default: null })
  departmentId: number;

  @Column({ name: 'role_id', nullable: false })
  roleId: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EUserStatus,
    default: EUserStatus.ACTIVE,
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Department, (department) => department.users)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Form, (form) => form.creator)
  forms: Form[];

  @OneToMany(() => Submission, (submission) => submission.employee)
  submissions: Submission[];

  @OneToMany(() => Submission, (submission) => submission.manager)
  managedSubmissions: Submission[];

  @OneToMany(() => Department, (department) => department.director)
  departmentsManaged: Department[];

  @OneToOne(() => Department, (department) => department.manager)
  managedDepartment: Department;
}
