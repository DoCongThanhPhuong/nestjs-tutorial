import { AppConfig } from './app/app-config.type';
import { AuthConfig } from './auth/auth-config.type';
import { DatabaseConfig } from './database/database-config.type';
import { MailConfig } from './mail/mail-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  mail: MailConfig;
};
