import { BadRequestException } from '@nestjs/common';

export enum SubscriptionPlan {
  FREE = 'FREE',
  LEGENDARY = 'LEGENDARY', // no limits on anything, we use it for development and testing
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

export const LegendaryPlanLimits: SubscriptionPlanLimits = {
  users: undefined,
  projects: undefined,
  apiRequestsPerMinute: undefined,
};

export function getSubscriptionPlanLimits(
  plan: SubscriptionPlan,
): SubscriptionPlanLimits {
  switch (plan) {
    case SubscriptionPlan.FREE:
      return FreePlanLimits;
    case SubscriptionPlan.LEGENDARY:
      return LegendaryPlanLimits;
    default:
      throw new BadRequestException(`Unknown subscription plan: ${plan}`);
  }
}
