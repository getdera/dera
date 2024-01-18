import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EmbeddingSchemasService } from './embedding-schemas.service';
import {
  CreateEmbeddingSchemaRequest,
  EmbeddingSchemaResponse,
  ListEmbeddingSchemasResponse,
} from './types';
import { AuthedRequest } from '../auth/types';
import { embeddingSchemaEntityToResponse } from './utils';
import { ProjectAccessGuard } from '../projects/project-access.guard';

@UseGuards(ProjectAccessGuard)
@Controller('/orgs/:orgId/projects/:projectId/embedding-schemas')
export class EmbeddingSchemasController {
  constructor(
    private readonly embeddingSchemasService: EmbeddingSchemasService,
  ) {}

  @Post()
  async createEmbeddingSchema(
    @Param('orgId') orgId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Request() request: AuthedRequest,
    @Body() createEmbeddingSchemaRequest: CreateEmbeddingSchemaRequest,
  ): Promise<EmbeddingSchemaResponse> {
    const embeddingSchemaEntity =
      await this.embeddingSchemasService.createEmbeddingSchema(
        orgId,
        projectId,
        request.user.id,
        createEmbeddingSchemaRequest,
      );

    return embeddingSchemaEntityToResponse(embeddingSchemaEntity);
  }

  @Get()
  async listEmbeddingSchemasInProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<ListEmbeddingSchemasResponse> {
    const embeddingSchemaEntities =
      await this.embeddingSchemasService.listEmbeddingSchemasInProject(
        projectId,
      );
    return {
      embeddingSchemas: embeddingSchemaEntities.map(
        embeddingSchemaEntityToResponse,
      ),
    };
  }

  /**
   * This must be before the `@Get(':embeddingSchemaId')` route, otherwise it won't be called.
   */
  @Get('default-fields')
  getDefaultFields(): {
    fields: {
      name: string;
      datatype: string;
      isNullable: boolean;
      isPrimaryKey: boolean;
      description: string;
    }[];
  } {
    const defaultFields = this.embeddingSchemasService.getDefaultFields();
    return {
      fields: defaultFields.map((field) => ({
        name: field.name,
        datatype: field.datatype,
        isNullable: field.isNullable,
        isPrimaryKey: field.isPrimaryKey,
        description: field.description,
      })),
    };
  }

  @Get(':embeddingSchemaId')
  async getEmbeddingSchema(
    @Param('orgId') orgId: string,
    @Param('embeddingSchemaId', ParseUUIDPipe) embeddingSchemaId: string,
  ): Promise<EmbeddingSchemaResponse> {
    const embeddingSchemaEntity =
      await this.embeddingSchemasService.getEmbeddingSchemaWithFields(
        orgId,
        embeddingSchemaId,
      );
    return embeddingSchemaEntityToResponse(embeddingSchemaEntity);
  }
}
