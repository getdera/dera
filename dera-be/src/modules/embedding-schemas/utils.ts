import { EmbeddingSchemaEntity } from './embedding-schema.entity';
import { PG_VARCHAR_TYPES } from './pg-data-types';
import { EmbeddingSchemaResponse } from './types';

export function embeddingSchemaEntityToResponse(
  embeddingSchemaEntity: EmbeddingSchemaEntity,
): EmbeddingSchemaResponse {
  return {
    id: embeddingSchemaEntity.id,
    createdAt: embeddingSchemaEntity.createdAt,
    updatedAt: embeddingSchemaEntity.updatedAt,
    projectId: embeddingSchemaEntity.projectId,
    creatorId: embeddingSchemaEntity.creatorId,
    name: embeddingSchemaEntity.name,
    description: embeddingSchemaEntity.description,
    fields:
      embeddingSchemaEntity.fields?.map((field) => ({
        id: field.id,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
        embeddingSchemaId: field.embeddingSchemaId,
        name: field.name,
        datatype: field.datatype,
        defaultValue: field.defaultValue,
        isNullable: field.isNullable,
        isUnique: field.isUnique,
        isPrimaryKey: field.isPrimaryKey,
        vectorLength: field.vectorLength,
      })) || [],
  };
}

export function quoteIfNeeded(datatype: string, value: string): string {
  if (PG_VARCHAR_TYPES.includes(datatype)) {
    return `'${value}'`;
  }
  return value;
}
