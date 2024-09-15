import { ACL } from 'src/modules/acl/entities/acl.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn({
    name: 'resource_id',
  })
  id: number;

  @Column({ name: 'resource_name' })
  name: string;

  @OneToMany(() => ACL, (acl) => acl.objectType)
  acl: ACL[];
}
