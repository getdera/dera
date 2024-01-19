import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { WebhookApi } from '../../utils/constants';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import { WebhooksService } from './webhooks.service';

export type WebhookConfig = {
  clerkOrgsWebhookSigningSecret: string;
};

@WebhookApi()
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    @Inject('WEBHOOKS_CONFIG') private readonly config: WebhookConfig,
    private readonly webhooksService: WebhooksService,
  ) {}

  @Post('clerk/orgs-changes')
  async handleClerkOrgsChanges(
    @Headers('svix-id') svixId: string | undefined,
    @Headers('svix-timestamp') svidxTimestamp: string | undefined,
    @Headers('svix-signature') svidxSignature: string | undefined,
    @Body() body: any,
  ) {
    if (!svixId || !svidxTimestamp || !svidxSignature) {
      throw new BadRequestException('Missing required headers');
    }

    const webhook = new Webhook(this.config.clerkOrgsWebhookSigningSecret);

    const event = this.verifyWebhookOrThrow(
      webhook,
      JSON.stringify(body),
      svixId,
      svidxTimestamp,
      svidxSignature,
    );

    await this.webhooksService.handleClerkOrgsChanges(event);
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
