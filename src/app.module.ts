import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import appConfig from './configs/app/app.config';
import authConfig from './configs/auth/auth.config';
import databaseConfig from './configs/database/database.config';
import googleConfig from './configs/google/google.config';
import mailConfig from './configs/mail/mail.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { JwtAuthGuard } from './guards';
import { AuthGoogleModule } from './modules/auth-google/auth-google.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, googleConfig, mailConfig],
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
    AuthModule,
    AuthGoogleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
