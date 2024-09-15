import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsModule } from '../departments/departments.module';
import { RedisModule } from '../redis/redis.module';
import { RolesModule } from '../roles/roles.module';
import { UploadModule } from '../upload/upload.module';
import { User } from './entities/user.entity';
import { AdminUsersController } from './admin-users.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    RolesModule,
    UploadModule,
    RedisModule,
    forwardRef(() => DepartmentsModule),
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
