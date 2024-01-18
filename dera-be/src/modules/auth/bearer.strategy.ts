import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Strategy } from 'passport-http-bearer';
import Clerk from '@clerk/clerk-sdk-node';
import { AuthedUser, BearerStrategyConfig } from './types';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  private logger = new Logger(BearerStrategy.name);

  constructor(
    @Inject('BEARER_STRATEGY_CONFIG')
    private readonly bearerStrategyConfig: BearerStrategyConfig,
  ) {
    super();
  }

  async validate(token: string): Promise<AuthedUser | null> {
    try {
      // This function from Clerk does all the verification stated
      // in https://clerk.com/docs/backend-requests/handling/manual-jwt#verify-the-token-signature.
      const res = await Clerk.verifyToken(token, {
        authorizedParties: this.bearerStrategyConfig.authorizedParties,
        issuer: this.bearerStrategyConfig.issuer,
      });
      return {
        id: res.sub,
        activeOrg: {
          id: res.org_id!,
          permissions: res.org_permissions!,
          role: res.org_role!,
          slug: res.org_slug!,
        },
        orgMemberships: res.org_memberships as { [orgId: string]: string },
      };
    } catch (err) {
      this.logger.warn({ err }, 'Invalid token.');
      return null;
    }
  }
}
