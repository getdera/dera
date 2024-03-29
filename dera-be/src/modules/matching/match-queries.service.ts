import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MatchQueryEntity,
  MatchQueryEntityWithSchemaJoined,
} from './match-query.entity';
import { Repository } from 'typeorm';
import { MatchQueryResultEntity } from './match-query-result.entity';
import { FindMatchQueriesFilter } from './types';

@Injectable()
export class MatchQueriesService {
  constructor(
    @InjectRepository(MatchQueryEntity)
    private readonly matchQueriesRepo: Repository<MatchQueryEntity>,
    @InjectRepository(MatchQueryResultEntity)
    private readonly matchQueryResultsRepo: Repository<MatchQueryResultEntity>,
  ) {}

  async findMatchQueries(
    orgId: string,
    filter: FindMatchQueriesFilter,
    page: number = 0,
  ): Promise<{
    queries: MatchQueryEntityWithSchemaJoined[];
    page: number;
    hasNextPage: boolean;
  }> {
    const batchSize = 20;
    const entities = (
      await this.matchQueriesRepo.find({
        where: {
          orgId,
          embeddingSchemaId: filter.embeddingSchemaId,
          content: filter.content,
          embeddingSchema: filter.projectId
            ? {
                projectId: filter.projectId,
              }
            : undefined,
        },
        relations: {
          embeddingSchema: true,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: batchSize * page,
        take: batchSize + 1,
      })
    ).map((ent) => ent as MatchQueryEntityWithSchemaJoined); // because we joined the relation above

    const hasNextPage = entities.length > batchSize;

    return {
      queries: entities.slice(0, batchSize),
      page,
      hasNextPage,
    };
  }

  async getMatchQueryResultsForQuery(
    orgId: string,
    queryId: string,
  ): Promise<MatchQueryResultEntity[]> {
    return await this.matchQueryResultsRepo.find({
      where: {
        matchQuery: {
          id: queryId,
          orgId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
