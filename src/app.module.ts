import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from './configs/app/app.config';
import authConfig from './configs/auth/auth.config';
import databaseConfig from './configs/database/database.config';
import mailConfig from './configs/mail/mail.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ExceptionFilter } from './filters/http-exception.filter';
import { JwtUserMiddleware } from './middlewares/jwt-auth.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { FieldsModule } from './modules/fields/fields.module';
import { FormTypesModule } from './modules/form-types/form-types.module';
import { FormsModule } from './modules/forms/forms.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RedisModule } from './modules/redis/redis.module';
import { RolesModule } from './modules/roles/roles.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { MailModule } from './modules/mail/mail.module';

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
    UploadModule,
    FormTypesModule,
    FieldsModule,
    JwtModule,
    RedisModule,
    PermissionsModule,
    MailModule,
  ],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
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
      .apply(JwtUserMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'auth/refresh-token', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
