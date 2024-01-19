import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plans';

@Entity({
  name: 'org_subscriptions',
})
export class OrgSubscriptionEntity {
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
    name: 'plan',
  })
  plan: SubscriptionPlan;
}
