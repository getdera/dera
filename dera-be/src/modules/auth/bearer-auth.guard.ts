import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_SDK_API } from '../../utils/constants';

@Injectable()
export class BearerAuthGuard extends AuthGuard('bearer') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isSdkApi = this.reflector.getAllAndOverride<boolean>(IS_SDK_API, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSdkApi) {
      return true;
    }

    return super.canActivate(context);
  }
}
