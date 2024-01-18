import { Module } from '@nestjs/common';
import { SdkApiEmbeddingsModule } from './sdk-api-embeddings/sdk-api-embeddings.module';
import { RouterModule } from '@nestjs/core';
import { SdkApiMatchingModule } from './sdk-api-matching/sdk-api-matching.module';

const SDK_API_PREFIX = 'sdk';

@Module({
  imports: [
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
