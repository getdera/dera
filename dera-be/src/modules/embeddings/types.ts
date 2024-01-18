import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const MAX_ROWS = 50;

export class EmbeddingInsertionDto {
  [field: string]: any;
}

// FEAT: allow columns and order to be specified
export type FetchDataParamsServiceDto = {
  limit?: number;
  offset?: number;
};

export type FetchDataResultsServiceDto = {
  fields: {
    name: string;
  }[];

  rows: { [field: string]: any }[];
};

export class FetchEmbeddingSchemaDataGetReq {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(MAX_ROWS)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}

export class PostgresField {
  @IsString()
  name: string;
}

export class EmbeddingSchemaData {
  [field: string]: any;
}

export class FetchEmbeddingSchemaDataGetResp {
  @IsArray()
  @Type(() => PostgresField)
  fields: PostgresField[];

  @IsArray()
  @Type(() => EmbeddingSchemaData)
  rows: EmbeddingSchemaData[];
}
