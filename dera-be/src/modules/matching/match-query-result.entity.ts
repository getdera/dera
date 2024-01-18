import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MatchResults } from './types';
import { MatchQueryEntity } from './match-query.entity';

@Entity({
  name: 'match_query_results',
})
export class MatchQueryResultEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @Column({
    name: 'match_query_id',
  })
  matchQueryId: string;

  @ManyToOne(() => MatchQueryEntity, { eager: false, nullable: false })
  @JoinColumn({
    name: 'match_query_id',
  })
  matchQuery?: MatchQueryEntity;

  @Column({
    name: 'match_query_result_body',
    type: 'jsonb',
    nullable: false,
  })
  resultBody: MatchResults;

  @Column({
    name: 'match_time_taken_ms',
  })
  matchTimeTakenMs: number;
}
