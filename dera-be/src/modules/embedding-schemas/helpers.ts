import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EmbeddingSchemaEntity } from './embedding-schema.entity';
import { NeonDetailsDto } from './types';

const logger = new Logger('EmbeddingSchemasServiceHelpers');

export function getNeonDetailsFromSchemaEntity(
  embeddingSchema: EmbeddingSchemaEntity,
): NeonDetailsDto {
  if (!embeddingSchema.project) {
    logger.error(
      `Project was not fetched together with embedding schema ${embeddingSchema.id} `,
    );
    throw new InternalServerErrorException('Internal server error');
  }

  return {
    neonProjectId: embeddingSchema.project.neonProjectId,
    neonRoleName: embeddingSchema.neonRoleName,
    neonEndpointId: embeddingSchema.neonEndpointId,
    neonEndpointHost: embeddingSchema.neonEndpointHost,
    neonBranchId: embeddingSchema.neonBranchId,
    neonBranchName: embeddingSchema.neonBranchName,
    neonBranchParentId: embeddingSchema.neonBranchParentId,
    neonDatabaseId: embeddingSchema.neonDatabaseId,
    neonDatabaseName: embeddingSchema.neonDatabaseName,
    embeddingTableName: embeddingSchema.name,
  };
}
