import { Module } from '@nestjs/common';
import { SdkApiMatchingController } from './sdk-api-matching.controller';
import { MatchingModule } from '../../matching/matching.module';
import { SdkTokensModule } from '../../sdk-tokens/sdk-tokens.module';
import { EmbeddingSchemasModule } from '../../embedding-schemas/embedding-schemas.module';

@Module({
  imports: [SdkTokensModule, EmbeddingSchemasModule, MatchingModule],
  controllers: [SdkApiMatchingController],
})
export class SdkApiMatchingModule {}
