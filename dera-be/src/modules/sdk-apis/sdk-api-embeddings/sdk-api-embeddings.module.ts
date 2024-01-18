import { Module } from '@nestjs/common';
import { SdkApiEmbeddingsController } from './sdk-api-embeddings.controller';
import { SdkTokensModule } from '../../sdk-tokens/sdk-tokens.module';
import { EmbeddingsModule } from '../../embeddings/embeddings.module';
import { EmbeddingSchemasModule } from '../../embedding-schemas/embedding-schemas.module';

@Module({
  imports: [SdkTokensModule, EmbeddingSchemasModule, EmbeddingsModule],
  controllers: [SdkApiEmbeddingsController],
})
export class SdkApiEmbeddingsModule {}
