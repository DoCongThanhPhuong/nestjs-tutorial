import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from './configs/app/app.config';
import authConfig from './configs/auth/auth.config';
import databaseConfig from './configs/database/database.config';
import mailConfig from './configs/mail/mail.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ExceptionFilter } from './filters/http-exception.filter';
import { JwtAuthMiddleware } from './middlewares/jwt-auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { PermissionsGuard } from './modules/auth/permission.guard';
import { DepartmentsModule } from './modules/departments/departments.module';
import { FieldsModule } from './modules/fields/fields.module';
import { FilesModule } from './modules/files/files.module';
import { FormTypesModule } from './modules/form-types/form-types.module';
import { FormsModule } from './modules/forms/forms.module';
import { MailModule } from './modules/mail/mail.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RedisModule } from './modules/redis/redis.module';
import { RolesModule } from './modules/roles/roles.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),
    UsersModule,
    RolesModule,
    AuthModule,
    FormsModule,
    SubmissionsModule,
    DepartmentsModule,
    FilesModule,
    FormTypesModule,
    FieldsModule,
    JwtModule,
    RedisModule,
    PermissionsModule,
    MailModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_FILTER,
      useFactory: () => {
        return new ExceptionFilter();
      },
      inject: [],
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.PATCH },
        { path: 'auth/refresh-token', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
