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

export class EffectiveMatchRequest {
  content: string;
  embeddings: number[];
  select: {
    additionalColumns: string[];
  };
  matchOperator: MatchOperator;
  limit: number;
  order: {
    column: string;
    order: Order;
  };
  matchScoreFilter: {
    filter: '>' | '<' | '=' | '>=' | '<=';
    score: number;
  } | null;
}

export class SearchMatchQueriesFilterReq {
  content: string;
  projectId: string;
  page: number = 0;
}

export class EmbeddingSchemaShortResp {
  embeddingSchemaId: string;
  name: string;
}

export class MatchQueryResp {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  orgId: string;
  embeddingSchemaId: string;
  fromApi: boolean;
  matchQueryBody: EffectiveMatchRequest;

  content: string;

  embeddingSchema: EmbeddingSchemaShortResp;
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
