import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { EmbeddingSchemasModule } from '../embedding-schemas/embedding-schemas.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchQueryEntity } from './match-query.entity';
import { MatchQueryResultEntity } from './match-query-result.entity';
import { MatchQueriesAndResultsController } from './match-queries-and-results.controller';
import { MatchQueriesService } from './match-queries.service';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchQueryEntity, MatchQueryResultEntity]),
    EmbeddingSchemasModule,
    ProjectsModule,
  ],
  controllers: [MatchQueriesAndResultsController],
  providers: [MatchingService, MatchQueriesService],
  exports: [MatchingService],
})
export class MatchingModule {}
