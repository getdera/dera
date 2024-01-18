import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import {
  BadRequestException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { recursivelyGetChildrenErrors } from './utils/validators';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet());

  const configService: ConfigService = app.get(ConfigService);

  const origins: RegExp[] = (configService.get('DERA_ALLOWED_ORIGINS') || '')
    .split(',')
    .map((v: string) => v.trim())
    .filter((v: string) => !!v)
    .map((v: string) => new RegExp(v, 'i'));

  app.set('trust proxy', true);
  app.enableCors({
    origin: origins,
  });

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.setGlobalPrefix('/api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const validationErrors = recursivelyGetChildrenErrors(errors, '');
        const responseJson = {
          statusCode: 400,
          message: 'Invalid inputs received.',
          error: 'Bad Request',
          validationErrors,
        };
        return new BadRequestException(responseJson);
      },
    }),
  );

  await app.listen(3001);
}
bootstrap();
