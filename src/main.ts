import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { AllConfigType } from './configs/config.type';
import { setupSwagger } from './configs/setup-swagger';
import { HttpExceptionFilter } from './filters';
import {
  ResolvePromisesInterceptor,
  ResponseInterceptor,
} from './interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);
  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
  );

  app.use(helmet());
  app.use(compression());
  app.use(morgan('dev'));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  const reflector = app.get(Reflector);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(reflector, {
      excludeExtraneousValues: true,
    }),
    new ResponseInterceptor(reflector),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  setupSwagger(app);
  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
bootstrap();
