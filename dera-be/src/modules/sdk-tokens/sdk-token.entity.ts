import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({
  name: 'sdk_tokens',
})
export class SdkTokenEntity {
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
    name: 'hashed_token',
  })
  hashedToken: string;

  @Column({
    name: 'name',
  })
  name: string;
}
