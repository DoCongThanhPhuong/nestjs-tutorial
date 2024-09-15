import { Field } from 'src/modules/fields/entities/field.entity';
import { FieldValueType } from 'src/utils/types';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Submission } from './submission.entity';

@Entity('field_values')
export class FieldValue {
  @PrimaryColumn({ name: 'submission_id' })
  submissionId: number;

  @PrimaryColumn({ name: 'field_id' })
  fieldId: number;

  @Column({ type: 'simple-json', name: 'value' })
  value: FieldValueType;

  @ManyToOne(() => Submission, (submission) => submission.fieldValues)
  @JoinColumn({ name: 'submission_id' })
  submission: Submission;

  @ManyToOne(() => Field, (field) => field.fieldValue)
  @JoinColumn({ name: 'field_id' })
  field: Field;
}
