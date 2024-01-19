import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgSubscriptionEntity } from './subscription.entity';
import { NoopSubscriptionsService } from './noop-subscriptions.service';
import { boolean } from 'boolean';
import { SubscriptionsService } from './abstract-subscriptions.service';
import { DefaultSubscriptionsService } from './default-subscriptions.service';
import * as path from 'path';

// need this for process.env to load from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

@Module({
  imports: [TypeOrmModule.forFeature([OrgSubscriptionEntity])],
  providers: [
    {
      provide: SubscriptionsService,
      useClass: boolean(process.env.ENABLE_SUBSCRIPTIONS)
        ? DefaultSubscriptionsService
        : NoopSubscriptionsService,
    },
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
