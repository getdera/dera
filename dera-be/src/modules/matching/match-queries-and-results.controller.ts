import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MatchQueriesService } from './match-queries.service';
import { OrgMembershipGuard } from '../auth/org-membership.guard';
import { ListMatchQueriesResp, ListMatchQueryResultResp } from './types';

@UseGuards(OrgMembershipGuard)
@Controller('orgs/:orgId')
export class MatchQueriesAndResultsController {
  constructor(private readonly matchQueriesService: MatchQueriesService) {}

  @Get('embedding-schemas/:embeddingSchemaId/match-queries')
  async getMatchQueriesinEmbeddingSchema(
    @Param('orgId') orgId: string,
    @Param('embeddingSchemaId', ParseUUIDPipe) embeddingSchemaId: string,
    @Query('page', ParseIntPipe) page: number = 0,
  ): Promise<ListMatchQueriesResp> {
    const entities =
      await this.matchQueriesService.getMatchQueriesinEmbeddingSchema(
        orgId,
        embeddingSchemaId,
        page,
      );
    return {
      queries: entities.queries.map((entity) => ({
        id: entity.id,
        createdAt: entity.createdAt,
        orgId: entity.orgId,
        embeddingSchemaId: entity.embeddingSchemaId,
        fromApi: entity.fromApi,
        matchQueryBody: entity.matchQueryBody,
      })),
      page: entities.page,
      hasNextPage: entities.hasNextPage,
    };
  }

  @Get('match-queries/:matchQueryId/results')
  async getMatchQueryResultsForQuery(
    @Param('orgId') orgId: string,
    @Param('matchQueryId', ParseUUIDPipe) matchQueryId: string,
  ): Promise<ListMatchQueryResultResp> {
    const entities =
      await this.matchQueriesService.getMatchQueryResultsForQuery(
        orgId,
        matchQueryId,
      );
    return {
      results: entities.map((entity) => ({
        id: entity.id,
        createdAt: entity.createdAt,
        matchQueryId: entity.matchQueryId,
        resultBody: entity.resultBody,
        matchTimeTakenMs: entity.matchTimeTakenMs,
      })),
    };
  }
}
