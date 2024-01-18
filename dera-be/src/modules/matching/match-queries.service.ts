import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchQueryEntity } from './match-query.entity';
import { Repository } from 'typeorm';
import { MatchQueryResultEntity } from './match-query-result.entity';

@Injectable()
export class MatchQueriesService {
  constructor(
    @InjectRepository(MatchQueryEntity)
    private readonly matchQueriesRepo: Repository<MatchQueryEntity>,
    @InjectRepository(MatchQueryResultEntity)
    private readonly matchQueryResultsRepo: Repository<MatchQueryResultEntity>,
  ) {}

  async getMatchQueriesinEmbeddingSchema(
    orgId: string,
    embeddingSchemaId: string,
    page: number = 0,
  ): Promise<{
    queries: MatchQueryEntity[];
    page: number;
    hasNextPage: boolean;
  }> {
    const batchSize = 20;
    const entities = await this.matchQueriesRepo.find({
      where: {
        embeddingSchemaId,
        orgId,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: batchSize * page,
      take: batchSize + 1,
    });

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
