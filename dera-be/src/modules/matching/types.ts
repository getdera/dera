import { Type } from 'class-transformer';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MatchOperator {
  L2 = 'L2',
  INNER_PRODUCT = 'INNER_PRODUCT',
  COSINE_DISTANCE = 'COSINE_DISTANCE',
}

/**
 * Multiple columns will be joined with AND
 */
type MetadataFilters = {
  filters: {
    column: string;
    operator: string;
    value: number | string;
  }[];
};

// FEAT: metadata filters
export type EmbeddingMatchReqDto = {
  content: string;
  embeddings: number[];
  select?: {
    additionalColumns: string[];
  };
  matchOperator?: MatchOperator;
  limit: number;
  order?: {
    column?: string;
    order?: Order;
  };
  matchScoreFilter?: {
    filter: '>' | '<' | '=' | '>=' | '<=';
    score: number;
  };
  /**
   * An array of metadata filters which will be joined with OR
   */
  metadataFilters?: MetadataFilters[];
};

export type EffectiveMatchRequest = Omit<
  EmbeddingMatchReqDto,
  'select' | 'matchOperator' | 'order' | 'matchScoreFilter' | 'metadataFilters'
> & {
  select: {
    additionalColumns: string[];
  };
  matchOperator: MatchOperator;
  order: {
    column: string;
    order: Order;
  };
  matchScoreFilter: {
    filter: '>' | '<' | '=' | '>=' | '<=';
    score: number;
  } | null;
  metadataFilters: MetadataFilters[];
};

export type MatchResults = {
  fields: {
    name: string;
  }[];
  rows: { [field: string]: any }[];
  numRows: number;
};

export type EmbeddingMatchResultDto = {
  effectiveRequest: EffectiveMatchRequest;
  results: MatchResults;
  matchTimeTakenMs: number;
};

export class MatchQueryResp {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  orgId: string;
  embeddingSchemaId: string;
  fromApi: boolean;
  matchQueryBody: EffectiveMatchRequest;
}

export class ListMatchQueriesResp {
  queries: MatchQueryResp[];
  page: number;
  hasNextPage: boolean;
}

export class ResultBodyResp {
  fields: {
    name: string;
  }[];
  rows: { [field: string]: any }[];
  numRows: number;
}

export class MatchQueryResultResp {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  matchQueryId: string;
  resultBody: ResultBodyResp;
  matchTimeTakenMs: number;
}

export class ListMatchQueryResultResp {
  results: MatchQueryResultResp[];
}
