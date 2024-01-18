import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmbeddingSchemaFieldEntity } from './embedding-schema-field.entity';
import { ProjectEntity } from '../projects/project.entity';

@Entity({
  name: 'embedding_schemas',
})
export class EmbeddingSchemaEntity {
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
    name: 'project_id',
  })
  projectId: string;

  @ManyToOne(() => ProjectEntity, { eager: false, nullable: false })
  @JoinColumn({
    name: 'project_id',
  })
  project?: ProjectEntity;

  @Column({
    name: 'creator_id',
  })
  creatorId: string;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'description',
    nullable: true,
    type: 'text',
  })
  description: string | null;

  @OneToMany(
    () => EmbeddingSchemaFieldEntity,
    (field) => field.embeddingSchema,
    { eager: false, cascade: true },
  )
  fields?: EmbeddingSchemaFieldEntity[];

  @Column({
    name: 'neon_role_name',
  })
  neonRoleName: string;

  @Column({
    name: 'neon_endpoint_id',
  })
  neonEndpointId: string;

  @Column({
    name: 'neon_endpoint_host',
  })
  neonEndpointHost: string;

  @Column({
    name: 'neon_branch_id',
  })
  neonBranchId: string;

  @Column({
    name: 'neon_branch_name',
  })
  neonBranchName: string;

  @Column({
    name: 'neon_branch_parent_id',
  })
  neonBranchParentId: string;

  @Column({
    name: 'neon_database_id',
  })
  neonDatabaseId: number;

  @Column({
    name: 'neon_database_name',
  })
  neonDatabaseName: string;
}
