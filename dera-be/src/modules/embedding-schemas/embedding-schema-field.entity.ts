import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmbeddingSchemaEntity } from './embedding-schema.entity';

@Entity({
  name: 'embedding_schema_fields',
})
export class EmbeddingSchemaFieldEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

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
    name: 'name',
  })
  name: string;

  @Column({
    name: 'datatype',
  })
  datatype: string;

  /**
   * null means no default value and not "null" as the default value
   */
  @Column({
    name: 'default_value',
    nullable: true,
    type: 'text',
  })
  defaultValue: string | null;

  @Column({
    name: 'is_nullable',
  })
  isNullable: boolean;

  @Column({
    name: 'is_unique',
  })
  isUnique: boolean;

  @Column({
    name: 'is_primary_key',
  })
  isPrimaryKey: boolean;

  /**
   * Only present for vector types.
   */
  @Column({
    name: 'vector_length',
    nullable: true,
    type: 'smallint',
  })
  vectorLength: number | null;
}
