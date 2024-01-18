import { Type } from 'class-transformer';
import { IsArray } from 'class-validator';
import { EmbeddingInsertionDto } from '../../embeddings/types';

export class BatchInsertEmbeddingsReq {
  @IsArray()
  @Type(() => EmbeddingInsertionDto)
  embeddings: EmbeddingInsertionDto[];
}
