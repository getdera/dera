import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmbeddingSchemaEntity } from './embedding-schema.entity';
import { Repository } from 'typeorm';
import {
  CreateEmbeddingSchemaFieldRequest,
  CreateEmbeddingSchemaRequest,
  NeonDetailsWithPasswordDto,
} from './types';
import { validate } from 'class-validator';
import { EmbeddingSchemaFieldEntity } from './embedding-schema-field.entity';
import { quoteIfNeeded } from './utils';
import { recursivelyGetChildrenErrors } from '../../utils/validators';
import { NeonService } from '../neon/neon.service';
import { ProjectsService } from '../projects/projects.service';
import { PG_VECTOR_TYPES } from './pg-data-types';
import { runSqlDdlsInTransaction } from '../../utils/pg.helpers';
import { getNeonDetailsFromSchemaEntity } from './helpers';

const DEFAULT_EMBEDDING_VECTOR_LENGTH = 1536;

@Injectable()
export class EmbeddingSchemasService {
  private readonly logger = new Logger(EmbeddingSchemasService.name);

  constructor(
    @InjectRepository(EmbeddingSchemaEntity)
    private readonly embeddingSchemaRepository: Repository<EmbeddingSchemaEntity>,
    private readonly projectsService: ProjectsService,
    private readonly neonService: NeonService,
  ) {}

  async createEmbeddingSchema(
    orgId: string,
    projectId: string,
    userId: string,
    createEmbeddingSchemaRequest: CreateEmbeddingSchemaRequest,
  ): Promise<EmbeddingSchemaEntity> {
    // validate against just to be sure
    await this.validateCreateEmbeddingSchemaRequest(
      createEmbeddingSchemaRequest,
    );

    const project = await this.projectsService.getProject(orgId, projectId);

    const defaultFields = this.getDefaultFields(
      createEmbeddingSchemaRequest.embeddingVectorLength,
    );
    const { fields: userDefinedFields } = createEmbeddingSchemaRequest;

    // check for duplicated fields
    this.checkForDuplicatedFields([...defaultFields, ...userDefinedFields]);

    const reqToEntity = (
      field: CreateEmbeddingSchemaFieldRequest,
      isPrimaryKey: boolean,
    ): EmbeddingSchemaFieldEntity => {
      const fieldEntity = new EmbeddingSchemaFieldEntity();
      fieldEntity.name = field.name;
      fieldEntity.datatype = field.datatype;
      fieldEntity.defaultValue = field.defaultValue;
      fieldEntity.isNullable = field.isNullable;
      fieldEntity.isUnique = field.isUnique;
      fieldEntity.isPrimaryKey = isPrimaryKey;
      fieldEntity.vectorLength =
        PG_VECTOR_TYPES.includes(field.datatype) && field.vectorLength
          ? field.vectorLength
          : null;
      return fieldEntity;
    };

    const embeddingSchemaFields = [
      ...defaultFields.map((field) => reqToEntity(field, field.isPrimaryKey)),
      ...userDefinedFields.map((field) => reqToEntity(field, false)),
    ];

    const neonBranch = await this.setupNeonBranch(project.neonProjectId);

    // BUG: we are not doing it now, but if any of the following fails, we should clean up the neon branch

    const sqlDdl = this.generateSqlDdl(
      createEmbeddingSchemaRequest.name,
      embeddingSchemaFields,
    );

    await runSqlDdlsInTransaction(
      {
        host: neonBranch.endpoint.host,
        port: 5432,
        user: neonBranch.role.name,
        password: neonBranch.role.password,
        database: neonBranch.database.name,
        ssl: true,
      },
      ['CREATE EXTENSION IF NOT EXISTS vector', sqlDdl],
    );

    const embeddingSchemaEntity = new EmbeddingSchemaEntity();
    embeddingSchemaEntity.name = createEmbeddingSchemaRequest.name;
    embeddingSchemaEntity.description =
      createEmbeddingSchemaRequest.description;
    embeddingSchemaEntity.projectId = projectId;
    embeddingSchemaEntity.creatorId = userId;
    embeddingSchemaEntity.neonRoleName = neonBranch.role.name;
    embeddingSchemaEntity.neonEndpointId = neonBranch.endpoint.id;
    embeddingSchemaEntity.neonEndpointHost = neonBranch.endpoint.host;
    embeddingSchemaEntity.neonBranchId = neonBranch.branch.id;
    embeddingSchemaEntity.neonBranchName = neonBranch.branch.name;
    embeddingSchemaEntity.neonBranchParentId = neonBranch.branch.parentBranchId;
    embeddingSchemaEntity.neonDatabaseId = neonBranch.database.id;
    embeddingSchemaEntity.neonDatabaseName = neonBranch.database.name;
    embeddingSchemaEntity.fields = embeddingSchemaFields;
    return await this.embeddingSchemaRepository.save(embeddingSchemaEntity);
  }

  async listEmbeddingSchemasInProject(
    projectId: string,
  ): Promise<EmbeddingSchemaEntity[]> {
    return await this.embeddingSchemaRepository.find({
      where: {
        projectId,
      },
      relations: {
        fields: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getEmbeddingSchemaWithFields(
    orgId: string,
    embeddingSchemaId: string,
    joinProject: boolean = false,
  ): Promise<EmbeddingSchemaEntity> {
    const entity = await this.embeddingSchemaRepository.findOne({
      where: {
        id: embeddingSchemaId,
        project: {
          orgId,
        },
      },
      relations: {
        ...(joinProject ? { project: true } : {}),
        fields: true,
      },
    });

    if (!entity) {
      throw new NotFoundException('Embedding schema not found');
    }

    return entity;
  }

  async getNeonDetailsWithPasswordFromEmbeddingSchema(
    orgId: string,
    embeddingSchemaId: string,
  ): Promise<NeonDetailsWithPasswordDto> {
    const embeddingSchemaEntity = await this.embeddingSchemaRepository.findOne({
      where: {
        id: embeddingSchemaId,
        project: {
          orgId,
        },
      },
      relations: {
        project: true,
      },
    });

    if (!embeddingSchemaEntity) {
      throw new NotFoundException('Embedding schema not found');
    }

    const rolePassword = await this.neonService.getRolePassword(
      embeddingSchemaEntity.project!.neonProjectId,
      embeddingSchemaEntity.neonBranchId,
      embeddingSchemaEntity.neonRoleName,
    );

    if (!rolePassword) {
      this.logger.error(
        `Unable to get role password for role ${
          embeddingSchemaEntity.neonRoleName
        } in project ${
          embeddingSchemaEntity.project!.neonProjectId
        } and branch ${embeddingSchemaEntity.neonBranchId}`,
      );
      throw new InternalServerErrorException('Unable to connect to database');
    }

    return {
      ...getNeonDetailsFromSchemaEntity(embeddingSchemaEntity),
      neonRolePassword: rolePassword,
    };
  }

  getDefaultFields(
    embeddingVectorLength?: number,
  ): (CreateEmbeddingSchemaFieldRequest & {
    isPrimaryKey: boolean;
    description: string;
  })[] {
    return [
      {
        name: 'id',
        datatype: 'text',
        defaultValue: null,
        isNullable: false,
        isUnique: true,
        isPrimaryKey: true,
        description: `Each embedding's unique identifier. This value is not auto-generated and should be provided by you when inserting embeddings.`,
      },
      {
        name: 'created_at',
        datatype: 'timestamptz',
        defaultValue: 'now()',
        isNullable: false,
        isUnique: false,
        isPrimaryKey: false,
        description: `The timestamp when the embedding is created.`,
      },
      {
        name: 'embedding_text',
        datatype: 'text',
        defaultValue: null,
        isNullable: false,
        isUnique: false,
        isPrimaryKey: false,
        description: `The text which the embedding is based on.`,
      },
      {
        name: 'embeddings',
        datatype: 'vector',
        defaultValue: null,
        isNullable: false,
        isUnique: false,
        isPrimaryKey: false,
        vectorLength: embeddingVectorLength || DEFAULT_EMBEDDING_VECTOR_LENGTH,
        description: `The vector embedding of embedding_text. Default length is set to 1536.`,
      },
      {
        name: 'original_text',
        datatype: 'text',
        defaultValue: null,
        isNullable: true,
        isUnique: false,
        isPrimaryKey: false,
        description: `The original text to preserve. This is optional (nullable) and is useful in cases where the embedding is done for modified texts but you want to retrieve the original unmodified text.`,
      },
    ];
  }

  private async setupNeonBranch(neonProjectId: string): Promise<{
    role: {
      name: string;
      password: string;
    };
    endpoint: {
      id: string;
      host: string;
    };
    branch: {
      id: string;
      name: string;
      parentBranchId: string;
    };
    database: {
      id: number;
      name: string;
    };
  }> {
    // don't specify parent branch id so that it will be created off main branch
    // FEAT: allow user to specify parent branch
    const branch = await this.neonService.createProjectBranch(neonProjectId);
    if (!branch) {
      throw new InternalServerErrorException(
        'Internal server error while creating branch',
      );
    }

    const role = branch.roles[0];
    const endpoint = branch.endpoints[0];
    const database = branch.databases[0];

    const password = await this.neonService.getRolePassword(
      neonProjectId,
      branch.branch.id,
      role.name,
    );
    if (!password) {
      throw new InternalServerErrorException(
        'Internal server error while getting role password',
      );
    }

    return {
      role: {
        name: role.name,
        password: password,
      },
      endpoint: {
        id: endpoint.id,
        host: endpoint.host,
      },
      branch: {
        id: branch.branch.id,
        name: branch.branch.name,
        parentBranchId: branch.branch.parent_id!,
      },
      database: {
        id: database.id,
        name: database.name,
      },
    };
  }

  private generateSqlDdl(
    tableName: string,
    fields: EmbeddingSchemaFieldEntity[],
  ) {
    return `CREATE TABLE ${tableName} (
      ${fields
        .map(
          (field) =>
            `${field.name} ${field.datatype} ${
              PG_VECTOR_TYPES.includes(field.datatype) && field.vectorLength
                ? `(${field.vectorLength})`
                : ''
            } ${field.isNullable ? '' : 'NOT NULL'} ${
              field.isUnique ? 'UNIQUE' : ''
            } ${field.isPrimaryKey ? 'PRIMARY KEY' : ''} ${
              field.defaultValue
                ? `DEFAULT ${quoteIfNeeded(field.datatype, field.defaultValue)}`
                : ''
            }`,
        )
        .join(',\n')}
    )`;
  }

  private async validateCreateEmbeddingSchemaRequest(
    createEmbeddingSchemaRequest: CreateEmbeddingSchemaRequest,
  ) {
    const valErrs = await validate(createEmbeddingSchemaRequest);
    if (valErrs.length) {
      const validationErrors = recursivelyGetChildrenErrors(valErrs, '');
      const responseJson = {
        statusCode: 400,
        message: 'Data validation failed.',
        error: 'Bad Request',
        validationErrors,
      };
      throw new BadRequestException(responseJson);
    }
  }

  private checkForDuplicatedFields(
    allFields: CreateEmbeddingSchemaFieldRequest[],
  ) {
    const fieldNames = new Set<string>();
    const duplicatedFieldNames = new Set<string>();

    for (const field of allFields) {
      if (fieldNames.has(field.name)) {
        duplicatedFieldNames.add(field.name);
        continue;
      }
      fieldNames.add(field.name);
    }

    if (duplicatedFieldNames.size > 0) {
      const responseJson = {
        statusCode: 400,
        message: `Duplicated field names: ${[...duplicatedFieldNames].join(
          ', ',
        )}`,
        error: 'Bad Request',
        validationErrors: [],
      };
      throw new BadRequestException(responseJson);
    }
  }
}
