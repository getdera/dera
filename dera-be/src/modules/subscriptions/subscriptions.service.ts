import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgSubscriptionEntity } from './subscription.entity';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './subscription-plans';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(OrgSubscriptionEntity)
    private readonly orgSubscriptionRepository: Repository<OrgSubscriptionEntity>,
  ) {}

  async getSubscription(orgId: string): Promise<OrgSubscriptionEntity | null> {
    return await this.orgSubscriptionRepository.findOne({
      where: {
        orgId,
      },
    });
  }

  async createFreeSubscriptionPlanOrReturnExisting(
    orgId: string,
  ): Promise<OrgSubscriptionEntity> {
    // A race condition could happen here if two requests come in at the same time.
    // The database would throw an error because of the unique constraint on orgId,
    // which ensures data integrity, but the second request would fail.
    // Ok for now, but should fix this in the future.
    const existingSubscription = await this.getSubscription(orgId);
    if (existingSubscription) {
      return existingSubscription;
    }

    const subscription = new OrgSubscriptionEntity();
    subscription.orgId = orgId;
    subscription.plan = SubscriptionPlan.FREE;
    return await this.orgSubscriptionRepository.save(subscription);
  }
}
