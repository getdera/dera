import { Injectable, Logger } from '@nestjs/common';
import { WebhooksService } from './abstract-webhooks.service';

@Injectable()
export class NoopWebhooksService implements WebhooksService {
  private readonly logger = new Logger(NoopWebhooksService.name);

  constructor() {
    this.logger.log(
      'Subscriptions are not enabled: NoopWebhooksService is injected.',
    );
  }

  async handleClerkOrgsChanges(
    svixId: string | undefined,
    svidxTimestamp: string | undefined,
    svidxSignature: string | undefined,
    body: any,
  ): Promise<void> {
    return;
  }
}
