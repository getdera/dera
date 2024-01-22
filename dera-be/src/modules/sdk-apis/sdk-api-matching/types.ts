import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum MatchOperator {
  L2 = 'L2',
  INNER_PRODUCT = 'INNER_PRODUCT',
  COSINE_DISTANCE = 'COSINE_DISTANCE',
}

class SelectReq {
  @IsArray()
  additionalColumns: string[];
}

class OrderReq {
  @IsOptional()
  @IsString()
  column?: string;

  @IsOptional()
  @IsEnum(Order)
  order?: Order;
}

class MatchScoreFilter {
  @IsIn(['>', '<', '=', '>=', '<='])
  filter: '>' | '<' | '=' | '>=' | '<=';

  @IsNumber()
  score: number;
}

class ColumnFilter {
  @IsString()
  @IsNotEmpty()
  column: string;

  @IsString()
  @IsNotEmpty()
  operator: string;

  @IsNotEmpty()
  value: number | string;
}
class MetadataFilters {
  /**
   * These filters will be joined with AND.
   */
  @IsArray()
  @ValidateNested()
  @Type(() => ColumnFilter)
  filters: ColumnFilter[];
}

export class EmbeddingMatchReq {
  @IsString()
  content: string;

  @IsArray()
  embeddings: number[];

  @IsOptional()
  @Type(() => SelectReq)
  @ValidateNested()
  select?: SelectReq;

  @IsOptional()
  @IsEnum(MatchOperator)
  matchOperator?: MatchOperator;

  @IsInt()
  @Min(1)
  @Max(20)
  limit: number;

  @IsOptional()
  @Type(() => OrderReq)
  @ValidateNested()
  order?: OrderReq;

  @IsOptional()
  @Type(() => MatchScoreFilter)
  @ValidateNested()
  matchScoreFilter?: MatchScoreFilter;

  /**
   * An array of metadata filters which will be joined with OR
   */
  @IsOptional()
  @IsArray()
  @Type(() => MetadataFilters)
  @ValidateNested()
  metadataFilters: MetadataFilters[];
}

export type EmbeddingMatchResp = {
  effectiveRequest: {
    content: string;
    embeddings: number[];
    limit: number;
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
  };
  results: {
    fields: {
      name: string;
    }[];

    rows: { [field: string]: any }[];
    numRows: number;
  };
  matchTimeTakenMs: number;
};
