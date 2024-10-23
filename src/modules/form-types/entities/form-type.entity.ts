import { EFormTypeScope } from 'src/constants';
import { Form } from 'src/modules/forms/entities/form.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('form_types')
export class FormType {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id' })
  id: number;

  @Column({ name: 'name', unique: true, nullable: false })
  name: string;

  @Column({
    name: 'scope',
    type: 'enum',
    enum: EFormTypeScope,
    default: EFormTypeScope.ALL,
    nullable: false,
  })
  scope: EFormTypeScope;

  @OneToMany(() => Form, (form) => form.formType)
  forms: Form[];
}
