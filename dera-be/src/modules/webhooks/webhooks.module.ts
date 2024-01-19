import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { boolean } from 'boolean';
import { WebhooksConfig, WebhooksService } from './abstract-webhooks.service';
import { DefaultWebhooksService } from './default-webhooks.service';
import { NoopWebhooksService } from './noop-webhooks.service';

import * as path from 'path';
import { ConfigService } from '@nestjs/config';

// need this for process.env to load from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

@Module({
  imports: [SubscriptionsModule],
  providers: [
    {
      provide: WebhooksService,
      useClass: boolean(process.env.ENABLE_SUBSCRIPTIONS)
        ? DefaultWebhooksService
        : NoopWebhooksService,
    },
    {
      provide: 'WEBHOOKS_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): WebhooksConfig => {
        return {
          clerkOrgsWebhookSigningSecret:
            configService.get<string>('CLERK_ORGS_WEBHOOK_SIGNING_SECRET') ||
            null,
        };
      },
    },
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
