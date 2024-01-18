import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProjectAccessGuard } from '../projects/project-access.guard';
import { EmbeddingsService } from './embeddings.service';
import {
  FetchEmbeddingSchemaDataGetReq,
  FetchEmbeddingSchemaDataGetResp,
} from './types';

@UseGuards(ProjectAccessGuard)
@Controller(
  '/orgs/:orgId/projects/:projectId/embedding-schemas/:embeddingSchemaId/data',
)
export class EmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  @Get()
  async fetchEmbeddingSchemaData(
    @Param('orgId') orgId: string,
    @Param('embeddingSchemaId', ParseUUIDPipe) embeddingSchemaId: string,
    @Query() fetchEmbeddingSchemaDataGetReq: FetchEmbeddingSchemaDataGetReq,
  ): Promise<FetchEmbeddingSchemaDataGetResp> {
    const res = await this.embeddingsService.fetchEmbeddingSchemaData(
      orgId,
      embeddingSchemaId,
      {
        limit: fetchEmbeddingSchemaDataGetReq.limit,
        offset: fetchEmbeddingSchemaDataGetReq.offset,
      },
    );

    return {
      fields: res.fields.map((field) => ({ name: field.name })),
      rows: res.rows,
    };
  }
}
