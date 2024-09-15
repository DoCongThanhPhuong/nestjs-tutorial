import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';
import { AdminDepartmentsController } from './admin-department.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department]),
    forwardRef(() => UsersModule),
    RedisModule,
  ],
  controllers: [DepartmentsController, AdminDepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
