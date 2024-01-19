import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class WebhooksService {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async handleClerkOrgsChanges(webhookEvent: WebhookEvent) {
    const eventType = webhookEvent.type;
    const orgId = webhookEvent.data.id;

    // this is the only event we care about at this point
    if (eventType !== 'organization.created') {
      return;
    }

    if (!orgId) {
      throw new BadRequestException('Missing orgId');
    }

    await this.subscriptionsService.createFreeSubscriptionPlanOrReturnExisting(
      orgId,
    );
  }
}
