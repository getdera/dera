import { BadRequestException } from '@nestjs/common';

export enum SubscriptionPlan {
  FREE = 'FREE',
}

export type SubscriptionPlanLimits = {
  // these are maximums
  users?: number;
  projects?: number;
  apiRequestsPerMinute?: number;
};

export const FreePlanLimits: SubscriptionPlanLimits = {
  users: 5,
  projects: 1,
  apiRequestsPerMinute: 20,
};

export function getSubscriptionPlanLimits(
  plan: SubscriptionPlan,
): SubscriptionPlanLimits {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return FreePlanLimits;
    default:
      throw new BadRequestException(`Unknown subscription plan: ${plan}`);
  }
}
