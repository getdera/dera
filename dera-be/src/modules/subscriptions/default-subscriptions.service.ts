import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgSubscriptionEntity } from './subscription.entity';
import { Repository } from 'typeorm';
import {
  SubscriptionPlan,
  getSubscriptionPlanLimits,
} from './subscription-plans';
import { SubscriptionsService } from './abstract-subscriptions.service';

@Injectable()
export class DefaultSubscriptionsService implements SubscriptionsService {
  private readonly logger = new Logger(DefaultSubscriptionsService.name);
  constructor(
    @InjectRepository(OrgSubscriptionEntity)
    private readonly orgSubscriptionRepository: Repository<OrgSubscriptionEntity>,
  ) {
    this.logger.log(
      'Subscriptions are enabled: DefaultSubscriptionsService is injected.',
    );
  }

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

  async numProjectsIsBelowPlanLimits(
    orgId: string,
    numProjects: number,
  ): Promise<boolean> {
    const subscription = await this.getSubscription(orgId);
    if (!subscription) {
      this.logger.error('Missing subscription for orgId: ' + orgId);
      return false;
    }

    const limits = getSubscriptionPlanLimits(subscription.plan);
    if (limits.projects === undefined) {
      return true;
    }
    return numProjects < limits.projects;
  }
}
