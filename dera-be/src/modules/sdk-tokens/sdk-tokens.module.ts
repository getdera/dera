import { Module } from '@nestjs/common';
import { SdkTokensController } from './sdk-tokens.controller';
import { SdkTokensService } from './sdk-tokens.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SdkTokenEntity } from './sdk-token.entity';
import { SdkApiAuthGuard } from './sdk-api-auth.guard';
import { EmbeddingSchemasModule } from '../embedding-schemas/embedding-schemas.module';

@Module({
  imports: [TypeOrmModule.forFeature([SdkTokenEntity]), EmbeddingSchemasModule],
  controllers: [SdkTokensController],
  providers: [SdkTokensService, SdkApiAuthGuard],
  exports: [SdkTokensService, SdkApiAuthGuard],
})
export class SdkTokensModule {}
