import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EffectiveMatchRequest } from './types';
import { MatchQueryResultEntity } from './match-query-result.entity';
import { EmbeddingSchemaEntity } from '../embedding-schemas/embedding-schema.entity';

@Entity({
  name: 'match_queries',
})
export class MatchQueryEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'org_id',
  })
  orgId: string;

  @Column({
    name: 'embedding_schema_id',
  })
  embeddingSchemaId: string;

  @ManyToOne(() => EmbeddingSchemaEntity, { eager: false, nullable: false })
  @JoinColumn({
    name: 'embedding_schema_id',
  })
  embeddingSchema?: EmbeddingSchemaEntity;

  @Column({
    name: 'from_api',
  })
  fromApi: boolean;

  @Column({
    name: 'match_query_body',
    type: 'jsonb',
    nullable: false,
  })
  matchQueryBody: EffectiveMatchRequest;

  @OneToMany(() => MatchQueryResultEntity, (result) => result.matchQuery, {
    eager: false,
    cascade: true,
  })
  results?: MatchQueryResultEntity[];
}
