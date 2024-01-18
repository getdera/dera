import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class CreateEmbeddingSchemaFieldRequest {
  name: string;
  datatype: string;
  defaultValue: string | null;
  isNullable: boolean;
  isUnique: boolean;
  vectorLength?: number;
}

export class CreateEmbeddingSchemaRequest {
  name: string;
  description: string | null;
  embeddingVectorLength?: number;
  fields: CreateEmbeddingSchemaFieldRequest[];
}

export class EmbeddingSchemaFieldResponse {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  embeddingSchemaId: string;

  name: string;

  datatype: string;

  defaultValue: string | null;

  isNullable: boolean;

  isUnique: boolean;

  isPrimaryKey: boolean;

  vectorLength: number | null;
}

export class EmbeddingSchemaResponse {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  projectId: string;

  creatorId: string;
  name: string;

  description: string | null;

  @ValidateNested()
  @Type(() => EmbeddingSchemaFieldResponse)
  fields: EmbeddingSchemaFieldResponse[];
}

export class ListEmbeddingSchemasResponse {
  @Type(() => EmbeddingSchemaResponse)
  embeddingSchemas: EmbeddingSchemaResponse[];
}

export class EmbeddingSchemaDefaultFieldsResp {
  fields: {
    name: string;
    datatype: string;
    isNullable: boolean;
    isPrimaryKey: boolean;
    description: string;
  }[];
}
