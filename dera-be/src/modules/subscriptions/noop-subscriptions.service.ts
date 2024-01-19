import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { OrgSubscriptionEntity } from './subscription.entity';
import { SubscriptionsService } from './abstract-subscriptions.service';

/**
 * This should only be injected when ENABLE_SUBSCRIPTIONS is false. i.e. for people to self-host.
 */
@Injectable()
export class NoopSubscriptionsService implements SubscriptionsService {
  private readonly logger = new Logger(NoopSubscriptionsService.name);
  constructor() {
    this.logger.warn(
      'Subscriptions are NOT enabled: NoopSubscriptionsService is injected.',
    );
  }

  async getSubscription(orgId: string): Promise<OrgSubscriptionEntity | null> {
    return null;
  }

  async createFreeSubscriptionPlanOrReturnExisting(
    orgId: string,
  ): Promise<OrgSubscriptionEntity> {
    throw new InternalServerErrorException('Subscriptions are not enabled.');
  }

  async numProjectsIsBelowPlanLimits(
    orgId: string,
    numProjects: number,
  ): Promise<boolean> {
    // when subscriptions are disabled, there are no limits
    return true;
  }
}
