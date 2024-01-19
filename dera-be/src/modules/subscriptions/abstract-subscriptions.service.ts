import { Injectable } from '@nestjs/common';
import { OrgSubscriptionEntity } from './subscription.entity';

@Injectable()
export abstract class SubscriptionsService {
  abstract getSubscription(
    orgId: string,
  ): Promise<OrgSubscriptionEntity | null>;

  abstract createFreeSubscriptionPlanOrReturnExisting(
    orgId: string,
  ): Promise<OrgSubscriptionEntity>;

  abstract numProjectsIsBelowPlanLimits(
    orgId: string,
    numProjects: number,
  ): Promise<boolean>;
}
