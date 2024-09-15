import { EFieldType } from 'src/constants';
import { Form } from 'src/modules/forms/entities/form.entity';
import { FieldValue } from 'src/modules/submissions/entities/field-value.entity';
import { FieldOptionsType } from 'src/utils/types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ name: 'label', nullable: false })
  label: string;

  @Column({ name: 'type', type: 'enum', enum: EFieldType, nullable: false })
  type: EFieldType;

  @Column({ name: 'required', default: true, nullable: false })
  required: boolean;

  @Column({ name: 'options', type: 'simple-json', nullable: true })
  options: FieldOptionsType;

  @Column({ name: 'form_id', nullable: false })
  formId: number;

  @OneToMany(() => FieldValue, (FieldValue) => FieldValue.field)
  fieldValue: FieldValue[];

  @ManyToOne(() => Form, (form) => form.fields, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'form_id' })
  form: Form;
}
