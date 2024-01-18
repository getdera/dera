import { Type } from 'class-transformer';
import { IsString, IsArray } from 'class-validator';

export class FetchEmbeddingSchemaDataGetReq {
  limit?: number;
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
