import { WebhookEvent } from '@clerk/clerk-sdk-node';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions/abstract-subscriptions.service';
import { WebhooksConfig, WebhooksService } from './abstract-webhooks.service';
import { Webhook } from 'svix';

@Injectable()
export class DefaultWebhooksService implements WebhooksService {
  private readonly logger = new Logger(DefaultWebhooksService.name);
  private readonly clerkOrgsWebhookSigningSecret: string;

  constructor(
    @Inject('WEBHOOKS_CONFIG') webhooksConfig: WebhooksConfig,
    private readonly subscriptionsService: SubscriptionsService,
  ) {
    this.logger.log(
      'Subscriptions are enabled: DefaultWebhooksService is injected.',
    );
    if (!webhooksConfig.clerkOrgsWebhookSigningSecret) {
      this.logger.error(
        'Missing clerkOrgsWebhookSigningSecret when subscriptions is enabled',
      );
      throw new Error('Invalid configuration');
    }
    this.clerkOrgsWebhookSigningSecret =
      webhooksConfig.clerkOrgsWebhookSigningSecret;
  }

  async handleClerkOrgsChanges(
    svixId: string | undefined,
    svidxTimestamp: string | undefined,
    svidxSignature: string | undefined,
    body: any,
  ): Promise<void> {
    if (!svixId || !svidxTimestamp || !svidxSignature) {
      throw new BadRequestException('Missing required headers');
    }

    const webhook = new Webhook(this.clerkOrgsWebhookSigningSecret);

    const webhookEvent = this.verifyWebhookOrThrow(
      webhook,
      JSON.stringify(body),
      svixId,
      svidxTimestamp,
      svidxSignature,
    );

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

  private verifyWebhookOrThrow(
    webhook: Webhook,
    payload: string,
    svixId: string,
    svidxTimestamp: string,
    svidxSignature: string,
  ): WebhookEvent {
    try {
      return webhook.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svidxTimestamp,
        'svix-signature': svidxSignature,
      }) as WebhookEvent;
    } catch (err) {
      this.logger.error({ err }, 'Failed to verify webhook');
      throw new BadRequestException('Failed to verify webhook');
    }
  }
}
