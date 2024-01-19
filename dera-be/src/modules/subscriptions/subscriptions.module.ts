import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgSubscriptionEntity } from './subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgSubscriptionEntity])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
