import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import validateConfig from 'src/utils/validate-configs';
import { DatabaseConfig } from './database-config.type';

class EnvironmentVariablesValidator {
  @IsString()
  DATABASE_TYPE: string;

  @IsString()
  DATABASE_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_DB: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;
}

export default registerAs<DatabaseConfig>('database', () => {
  const config = {
    DATABASE_TYPE: process.env.DATABASE_TYPE,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: parseInt(process.env.DATABASE_PORT, 10),
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_DB: process.env.DATABASE_DB,
    DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE === 'true',
    DATABASE_MAX_CONNECTIONS: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 10,
  };

  const validatedConfig = validateConfig(config, EnvironmentVariablesValidator);

  return {
    type: validatedConfig.DATABASE_TYPE,
    host: validatedConfig.DATABASE_HOST,
    port: validatedConfig.DATABASE_PORT,
    username: validatedConfig.DATABASE_USERNAME,
    password: validatedConfig.DATABASE_PASSWORD,
    database: validatedConfig.DATABASE_DB,
    synchronize: validatedConfig.DATABASE_SYNCHRONIZE,
    maxConnections: validatedConfig.DATABASE_MAX_CONNECTIONS,
  };
});
