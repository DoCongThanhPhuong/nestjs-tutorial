import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { AllConfigType } from './configs/config.type';
import { setupSwagger } from './configs/setup-swagger';
import { ResponseInterceptor } from './interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  app.use(helmet());
  app.use(morgan('dev'));
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector, {
      excludeExtraneousValues: true,
    }),
    new ResponseInterceptor(reflector),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  setupSwagger(app);
  const appPort = configService.get('app.port', { infer: true });
  await app.listen(appPort).then(() => {
    Logger.log(`Server listening on port: ${appPort}`);
  });
}
bootstrap();
