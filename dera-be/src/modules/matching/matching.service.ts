import { BadRequestException, Injectable } from '@nestjs/common';
import {
  EffectiveMatchRequest,
  EmbeddingMatchReqDto,
  EmbeddingMatchResultDto,
  MatchOperator,
  Order,
} from './types';
import { EmbeddingSchemasService } from '../embedding-schemas/embedding-schemas.service';
import {
  ParameterizedQuery,
  runSqlDdlGetResults,
} from '../../utils/pg.helpers';
import { matchOperatorLabelToSql, postProcessMatchOpQuery } from './helpers';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchQueryEntity } from './match-query.entity';
import { Repository } from 'typeorm';
import { MatchQueryResultEntity } from './match-query-result.entity';
import { QueryResult } from 'pg';

const MATCHED_SCORE_COL_NAME = 'matched_score';

@Injectable()
export class MatchingService {
  constructor(
    private readonly embeddingSchemasService: EmbeddingSchemasService,
    @InjectRepository(MatchQueryEntity)
    private readonly matchQueryRepo: Repository<MatchQueryEntity>,
  ) {}

  // FEAT: check column names in filters with schema to make sure they exist
  async match(
    orgId: string,
    fromApi: boolean,
    embeddingSchemaId: string,
    matchReqDto: EmbeddingMatchReqDto,
  ): Promise<EmbeddingMatchResultDto> {
    const effectiveRequest = this.buildEffectiveRequest(matchReqDto);

    const neonDetailsWithPassword =
      await this.embeddingSchemasService.getNeonDetailsWithPasswordFromEmbeddingSchema(
        orgId,
        embeddingSchemaId,
      );

    const query = this.generateSelectDdl(
      neonDetailsWithPassword.embeddingTableName,
      effectiveRequest,
    );

    let results: {
      res: QueryResult<any>;
      timeTakenMs: number;
    } | null = null;
    try {
      results = await runSqlDdlGetResults(
        {
          host: neonDetailsWithPassword.neonEndpointHost,
          port: 5432,
          user: neonDetailsWithPassword.neonRoleName,
          password: neonDetailsWithPassword.neonRolePassword,
          database: neonDetailsWithPassword.neonDatabaseName,
          ssl: true,
        },
        query,
      );
    } catch (err) {
      throw new BadRequestException(err.message);
    }

    const { res, timeTakenMs } = results;

    const matchResults = {
      fields: res.fields.map((f) => ({ name: f.name })),
      rows: res.rows,
      numRows: res.rows.length,
    };

    const matchQueryEntity = new MatchQueryEntity();
    matchQueryEntity.orgId = orgId;
    matchQueryEntity.embeddingSchemaId = embeddingSchemaId;
    matchQueryEntity.fromApi = fromApi;
    matchQueryEntity.matchQueryBody = effectiveRequest;
    matchQueryEntity.content = effectiveRequest.content;
    const matchQueryResultEntity = new MatchQueryResultEntity();
    matchQueryResultEntity.resultBody = matchResults;
    matchQueryResultEntity.matchTimeTakenMs = timeTakenMs;
    matchQueryEntity.results = [matchQueryResultEntity];
    await this.matchQueryRepo.save(matchQueryEntity);

    return {
      effectiveRequest,
      results: matchResults,
      matchTimeTakenMs: timeTakenMs,
    };
  }

  private buildEffectiveRequest(
    matchReqDto: EmbeddingMatchReqDto,
  ): EffectiveMatchRequest {
    return {
      ...matchReqDto,
      select: {
        additionalColumns: matchReqDto.select?.additionalColumns || [],
      },
      matchOperator: matchReqDto.matchOperator || MatchOperator.COSINE_DISTANCE,
      order: {
        column: matchReqDto.order?.column || MATCHED_SCORE_COL_NAME,
        order: matchReqDto.order?.order || Order.DESC,
      },
      matchScoreFilter: matchReqDto.matchScoreFilter || null,
      metadataFilters: matchReqDto.metadataFilters || [],
    };
  }

  private generateSelectDdl(
    tableName: string,
    effectiveRequest: EffectiveMatchRequest,
  ): ParameterizedQuery {
    // the name of the column where we store embeddings for matching
    const embeddingsColumnName = 'embeddings';

    const matchSqlOp = matchOperatorLabelToSql(effectiveRequest.matchOperator);

    const matchQuery = postProcessMatchOpQuery(
      effectiveRequest.matchOperator,
      `${embeddingsColumnName} ${matchSqlOp} '${JSON.stringify(
        effectiveRequest.embeddings,
      )}'`,
    );
    const matchedScoreCol = `${matchQuery} AS ${MATCHED_SCORE_COL_NAME}`;

    const defaultColumns = this.embeddingSchemasService
      .getDefaultFields()
      .map((f) => f.name);
    const selectColumns = [
      matchedScoreCol,
      ...defaultColumns,
      ...effectiveRequest.select.additionalColumns,
    ];

    let parameterIndex = 1;

    const parameterizedValues: any[] = [];

    let matchScoreFilter = '';
    if (effectiveRequest.matchScoreFilter) {
      matchScoreFilter = `${matchQuery} ${
        effectiveRequest.matchScoreFilter.filter
      } $${parameterIndex++}`;
      parameterizedValues.push(effectiveRequest.matchScoreFilter.score);
    }

    const metadataFilters = effectiveRequest.metadataFilters
      .map((metadataFilter) => {
        return metadataFilter.filters
          .map((filter) => {
            parameterizedValues.push(filter.value);
            return `${filter.column} ${filter.operator} $${parameterIndex++}`;
          })
          .join(' AND ');
      })
      .join(' OR ');

    const filter = `${matchScoreFilter || ''} ${
      matchScoreFilter && metadataFilters ? 'AND' : ''
    } ${metadataFilters || ''}`;

    const orderBy = `${effectiveRequest.order.column} ${effectiveRequest.order.order}`;

    const limit = `$${parameterIndex++}`;
    parameterizedValues.push(effectiveRequest.limit);

    return {
      text: `SELECT ${selectColumns} FROM ${tableName}${
        filter ? ` WHERE ${filter}` : ''
      } ORDER BY ${orderBy} LIMIT ${limit}`,
      values: parameterizedValues,
    };
  }
}
