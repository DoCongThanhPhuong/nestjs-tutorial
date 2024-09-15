import { Module } from '@nestjs/common';
import { ACLController } from './acl.controller';
import { ACLService } from './acl.service';

@Module({
  controllers: [ACLController],
  providers: [ACLService],
})
export class ACLModule {}
