import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './utils/exception-filter';
import { BearerAuthGuard } from './modules/auth/bearer-auth.guard';
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerOptions } from 'typeorm';

import fs from 'fs';
import { EmbeddingSchemasModule } from './modules/embedding-schemas/embedding-schemas.module';
import { SdkApisModule } from './modules/sdk-apis/sdk-apis.module';
import { SdkTokensModule } from './modules/sdk-tokens/sdk-tokens.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { MatchingModule } from './modules/matching/matching.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        synchronize: false, // never set true in production!
        autoLoadEntities: true,
        logging: configService.get<string>('DERA_DB_LOGGING') as LoggerOptions,
        host: configService.get<string>('DERA_DB_HOST'),
        port: configService.get<number>('DERA_DB_PORT'),
        username: configService.get<string>('DERA_DB_USER_NAME'),
        password: configService.get<string>('DERA_DB_USER_PW'),
        database: configService.get<string>('DERA_DB_NAME'),
        ssl: configService.get<string>('DERA_DB_SSL_CERT')
          ? {
              rejectUnauthorized: true,
              ca: fs
                .readFileSync(configService.get<string>('DERA_DB_SSL_CERT')!)
                .toString(),
            }
          : undefined,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ProjectsModule,
    EmbeddingSchemasModule,
    EmbeddingsModule,
    SdkApisModule,
    SdkTokensModule,
    MatchingModule,
    WebhooksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: BearerAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
