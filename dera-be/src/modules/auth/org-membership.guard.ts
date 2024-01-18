import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthedUser } from './types';

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor() {}

  /**
   * Checks user is member of org but does not check for permissions or role. Must be used
   * on URLs that have an orgId path param.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const orgId = request.params.orgId;
    if (!orgId) {
      throw new UnauthorizedException('No orgId provided');
    }
    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    return !!user.orgMemberships[orgId];
  }
}
