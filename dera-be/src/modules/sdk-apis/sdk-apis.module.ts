import {
  ExecutionContext,
  InternalServerErrorException,
  Module,
} from '@nestjs/common';
import { SdkApiEmbeddingsModule } from './sdk-api-embeddings/sdk-api-embeddings.module';
import { RouterModule } from '@nestjs/core';
import { SdkApiMatchingModule } from './sdk-api-matching/sdk-api-matching.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { SubscriptionsService } from '../subscriptions/abstract-subscriptions.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { SdkApiAuthedRequest } from '../sdk-tokens/sdk-api-auth.guard';

const SDK_API_PREFIX = 'sdk';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [SubscriptionsModule],
      inject: [SubscriptionsService],
      useFactory: (
        subscriptionsService: SubscriptionsService,
      ): ThrottlerModuleOptions => {
        return [
          {
            ttl: 60000,
            generateKey: (context: ExecutionContext): string => {
              const request = context
                .switchToHttp()
                .getRequest() as SdkApiAuthedRequest;
              if (!request.apiCaller.org.id) {
                throw new InternalServerErrorException(
                  'No org id found on request',
                );
              }
              // we use the org id as the key so that the throttler will limit the number of requests per org
              return request.apiCaller.org.id;
            },
            limit: async (context: ExecutionContext): Promise<number> => {
              const request = context
                .switchToHttp()
                .getRequest() as SdkApiAuthedRequest;
              if (!request.apiCaller.org.id) {
                throw new InternalServerErrorException(
                  'No org id found on request',
                );
              }
              return await subscriptionsService.getApiRequestsPerMinuteLimit(
                request.apiCaller.org.id,
              );
            },
          },
        ];
      },
    }),
    SdkApiEmbeddingsModule,
    SdkApiMatchingModule,
    RouterModule.register([
      // this has to be done for every module that should be accessible via the user sdk (have not found a better way yet)
      {
        path: SDK_API_PREFIX,
        module: SdkApiEmbeddingsModule,
      },
      {
        path: SDK_API_PREFIX,
        module: SdkApiMatchingModule,
      },
    ]),
  ],
})
export class SdkApisModule {}
