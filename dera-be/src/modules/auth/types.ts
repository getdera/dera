import { Request } from 'express';

export type BearerStrategyConfig = {
  authorizedParties: string[];
  issuer: string;
};

export type AuthedUser = {
  id: string;
  activeOrg: {
    id: string;
    permissions: string[];
    role: string;
    slug: string;
  };
  orgMemberships: {
    // a key-value pair of orgId and role
    [orgId: string]: string;
  };
};

export type AuthedRequest = Request & {
  user: AuthedUser;
};
