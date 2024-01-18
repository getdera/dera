import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SdkApi } from '../../../utils/constants';
import {
  SdkApiAuthGuard,
  SdkApiAuthedRequest,
} from '../../sdk-tokens/sdk-api-auth.guard';
import { EmbeddingInsertionDto } from '../../embeddings/types';
import { EmbeddingsService } from '../../embeddings/embeddings.service';
import { BatchInsertEmbeddingsReq } from './types';

@UseGuards(SdkApiAuthGuard)
@SdkApi()
@Controller('embedding-schemas/:embeddingSchemaId/embeddings')
export class SdkApiEmbeddingsController {
  constructor(private readonly embeddingsService: EmbeddingsService) {}

  @Post()
  async insertEmbedding(
    @Request() req: SdkApiAuthedRequest,
    @Param('embeddingSchemaId', ParseUUIDPipe) embeddingSchemaId: string,
    @Body() embeddingInsertionDto: EmbeddingInsertionDto,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await this.embeddingsService.insertEmbedding(
      req.apiCaller.org.id,
      embeddingSchemaId,
      embeddingInsertionDto,
    );
    return {
      success: true,
      message: `${res.rowsInserted} ${
        res.rowsInserted > 1 ? 'embeddings' : 'embedding'
      } inserted.`,
    };
  }

  @Post('batch')
  async batchInsertEmbeddings(
    @Request() req: SdkApiAuthedRequest,
    @Param('embeddingSchemaId', ParseUUIDPipe) embeddingSchemaId: string,
    @Body() batchInsertEmbeddingsReq: BatchInsertEmbeddingsReq,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const res = await this.embeddingsService.batchInsertEmbeddings(
      req.apiCaller.org.id,
      embeddingSchemaId,
      batchInsertEmbeddingsReq.embeddings,
    );
    return {
      success: true,
      message: `${res.rowsInserted} ${
        res.rowsInserted > 1 ? 'embeddings' : 'embedding'
      } inserted.`,
    };
  }
}
