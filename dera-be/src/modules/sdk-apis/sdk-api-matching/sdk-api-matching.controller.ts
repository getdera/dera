import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MatchingService } from '../../matching/matching.service';
import { SdkApi } from '../../../utils/constants';
import {
  SdkApiAuthGuard,
  SdkApiAuthedRequest,
} from '../../sdk-tokens/sdk-api-auth.guard';
import { EmbeddingMatchReq, EmbeddingMatchResp } from './types';

@UseGuards(SdkApiAuthGuard)
@SdkApi()
@Controller('embedding-schemas/:embeddingSchemaId/match')
export class SdkApiMatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post()
  async match(
    @Request() req: SdkApiAuthedRequest,
    @Param('embeddingSchemaId') embeddingSchemaId: string,
    @Body() matchRequest: EmbeddingMatchReq,
  ): Promise<EmbeddingMatchResp> {
    const matchResponse = await this.matchingService.match(
      req.apiCaller.org.id,
      true,
      embeddingSchemaId,
      matchRequest,
    );
    return {
      effectiveRequest: matchResponse.effectiveRequest,
      results: matchResponse.results,
      matchTimeTakenMs: matchResponse.matchTimeTakenMs,
    };
  }
}
