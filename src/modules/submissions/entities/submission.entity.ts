import { ESubmissionStatus } from 'src/constants';
import { Form } from 'src/modules/forms/entities/form.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldValue } from './field-value.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ESubmissionStatus,
    default: ESubmissionStatus.PENDING,
  })
  status: ESubmissionStatus;

  @Column({ name: 'rejection_reason', type: 'text', default: null })
  rejectionReason: string;

  @Column({ name: 'submitted_at', default: null })
  submittedAt: Date;

  @Column({ name: 'form_id', nullable: false })
  formId: number;

  @Column({ name: 'employee_id', nullable: false })
  employeeId: number;

  @Column({ name: 'manager_id', nullable: false })
  managerId: number;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @ManyToOne(() => User, (user) => user.managedSubmissions)
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => Form, (form) => form.submissions)
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @OneToMany(() => FieldValue, (fieldValue) => fieldValue.submission)
  fieldValues: FieldValue[];
}
