import { Module } from '@nestjs/common';
import { WebhookConfig, WebhooksController } from './webhooks.controller';
import { ConfigService } from '@nestjs/config';
import { WebhooksService } from './webhooks.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  providers: [
    {
      provide: 'WEBHOOKS_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): WebhookConfig => {
        return {
          clerkOrgsWebhookSigningSecret: configService.getOrThrow<string>(
            'CLERK_ORGS_WEBHOOK_SIGNING_SECRET',
          ),
        };
      },
    },
    WebhooksService,
  ],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
