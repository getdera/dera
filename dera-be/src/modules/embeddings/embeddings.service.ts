import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  EmbeddingInsertionDto,
  FetchDataParamsServiceDto,
  FetchDataResultsServiceDto,
  MAX_ROWS,
} from './types';
import { EmbeddingSchemasService } from '../embedding-schemas/embedding-schemas.service';
import { NeonService } from '../neon/neon.service';
import {
  ParameterizedQuery,
  runSqlDdlGetResults,
  runSqlDdlsInTransaction,
} from '../../utils/pg.helpers';
import { EmbeddingSchemaFieldEntity } from '../embedding-schemas/embedding-schema-field.entity';
import { getNeonDetailsFromSchemaEntity } from '../embedding-schemas/helpers';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(
    private readonly embeddingSchemasService: EmbeddingSchemasService,
    private readonly neonService: NeonService,
  ) {}

  async batchInsertEmbeddings(
    orgId: string,
    embeddingSchemaId: string,
    embeddings: EmbeddingInsertionDto[],
  ): Promise<{
    rowsInserted: number;
  }> {
    return await this.insertEmbeddingsHelper(
      orgId,
      embeddingSchemaId,
      embeddings,
    );
  }

  async insertEmbedding(
    orgId: string,
    embeddingSchemaId: string,
    embedding: EmbeddingInsertionDto,
  ): Promise<{
    rowsInserted: number;
  }> {
    return await this.insertEmbeddingsHelper(orgId, embeddingSchemaId, [
      embedding,
    ]);
  }

  async fetchEmbeddingSchemaData(
    orgId: string,
    embeddingSchemaId: string,
    fetchDataParams: FetchDataParamsServiceDto,
  ): Promise<FetchDataResultsServiceDto> {
    if (fetchDataParams.limit && fetchDataParams.limit > MAX_ROWS) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_ROWS}`);
    } else if (fetchDataParams.limit && fetchDataParams.limit < 0) {
      throw new BadRequestException('Limit cannot be negative');
    } else if (fetchDataParams.offset && fetchDataParams.offset < 0) {
      throw new BadRequestException('Offset cannot be negative');
    }

    const neonDetailsWithPassword =
      await this.embeddingSchemasService.getNeonDetailsWithPasswordFromEmbeddingSchema(
        orgId,
        embeddingSchemaId,
      );

    const query = this.generateSelectDataDdl(
      neonDetailsWithPassword.embeddingTableName,
      fetchDataParams,
    );

    const results = await runSqlDdlGetResults(
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

    return {
      fields: results.res.fields.map((f) => ({ name: f.name })),
      rows: results.res.rows,
    };
  }

  private async insertEmbeddingsHelper(
    orgId: string,
    embeddingSchemaId: string,
    embeddings: EmbeddingInsertionDto[],
  ): Promise<{
    rowsInserted: number;
  }> {
    const embeddingSchema =
      await this.embeddingSchemasService.getEmbeddingSchemaWithFields(
        orgId,
        embeddingSchemaId,
        true,
      );

    const insertionDdls = this.generateInsertionDdls(
      embeddingSchema.name,
      embeddingSchema.fields!,
      embeddings,
    );

    if (!insertionDdls.length) {
      return {
        rowsInserted: 0,
      };
    }

    const neonDetails = getNeonDetailsFromSchemaEntity(embeddingSchema);

    const rolePassword = await this.neonService.getRolePassword(
      neonDetails.neonProjectId,
      neonDetails.neonBranchId,
      neonDetails.neonRoleName,
    );

    if (!rolePassword) {
      this.logger.error(
        `Unable to get role password for role ${neonDetails.neonRoleName} in project ${neonDetails.neonProjectId} and branch ${neonDetails.neonBranchId}`,
      );
      throw new InternalServerErrorException('Unable to connect to database');
    }

    try {
      await runSqlDdlsInTransaction(
        {
          host: neonDetails.neonEndpointHost,
          port: 5432,
          user: neonDetails.neonRoleName,
          password: rolePassword,
          database: neonDetails.neonDatabaseName,
          ssl: true,
        },
        insertionDdls,
      );
      return {
        rowsInserted: insertionDdls.length,
      };
    } catch (err) {
      if (err.detail) {
        throw new BadRequestException(err.detail);
      } else {
        this.logger.error({ err }, 'Error inserting embeddings');
        throw new InternalServerErrorException('Error inserting embeddings');
      }
    }
  }

  private generateInsertionDdls(
    tableName: string,
    // FEAT: validate data types first so that we can throw a 400 error early instead of waiting for the DB to throw an error. This will require the argument embeddingSchemaFieldEntities.
    embeddingSchemaFieldEntities: EmbeddingSchemaFieldEntity[],
    embeddings: EmbeddingInsertionDto[],
  ): ParameterizedQuery[] {
    // Generate separate insertion ddls for each embedding. This allows each object to have different fields specified and use null/default value accordingly.
    return embeddings
      .filter((embedding) => !!Object.keys(embedding).length)
      .map((embedding) => {
        const fields = Object.keys(embedding);
        const placeholders = fields.map((_, index) => `$${index + 1}`);
        const values = fields.map((field) => embedding[field]);
        const text = `INSERT INTO ${tableName} (${fields.join(
          ', ',
        )}) VALUES (${placeholders.join(', ')})`;
        return {
          text,
          values,
        };
      });
  }

  private generateSelectDataDdl(
    tableName: string,
    fetchDataParams: FetchDataParamsServiceDto,
  ): ParameterizedQuery {
    return {
      text: `SELECT * FROM ${tableName} LIMIT $1 OFFSET $2`,
      values: [fetchDataParams.limit || MAX_ROWS, fetchDataParams.offset || 0],
    };
  }
}
