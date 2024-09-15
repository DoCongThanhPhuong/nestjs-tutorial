import { FormType } from 'src/modules/form-types/entities/form-type.entity';
import { Submission } from 'src/modules/submissions/entities/submission.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Field } from '../../fields/entities/field.entity';

@Entity('forms')
export class Form {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ name: 'title', nullable: false })
  title: string;

  @Column({ name: 'description', type: 'text', default: null })
  description: string;

  @Column({ name: 'form_type_id' })
  formTypeId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @Column({ name: 'published_at', default: null })
  publishedAt: Date;

  @Column({ name: 'is_published', default: false, nullable: false })
  isPublished: boolean;

  @Column({ name: 'closed_at', default: null })
  closedAt: Date;

  @ManyToOne(() => FormType, (formType) => formType.forms)
  @JoinColumn({ name: 'form_type_id' })
  formType: FormType;

  @ManyToOne(() => User, (user) => user.forms)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @OneToMany(() => Submission, (submission) => submission.form)
  submissions: Submission[];

  @OneToMany(() => Field, (field) => field.form, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  fields: Field[];
}
