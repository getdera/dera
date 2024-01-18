import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'projects',
})
export class ProjectEntity {
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
    name: 'org_id',
  })
  orgId: string;

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

  @Column({
    name: 'neon_project_id',
  })
  neonProjectId: string;
}
