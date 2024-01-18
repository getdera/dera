import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { EmbeddingSchemasModule } from '../embedding-schemas/embedding-schemas.module';
import { NeonModule } from '../neon/neon.module';
import { EmbeddingsController } from './embeddings.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [EmbeddingSchemasModule, NeonModule, ProjectsModule],
  providers: [EmbeddingsService],
  controllers: [EmbeddingsController],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
