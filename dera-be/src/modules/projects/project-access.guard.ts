import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate as uuidValidate } from 'uuid';
import { AuthedUser } from '../auth/types';
import { ProjectsService } from './projects.service';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Checks user has access to project. Must be used on URLs that have an orgId path param and a projectId path param.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const orgId = request.params.orgId;
    const projectId = request.params.projectId;

    if (!orgId || !projectId) {
      throw new UnauthorizedException('Missing orgId or projectId provided');
    }
    if (!uuidValidate(projectId)) {
      return false;
    }
    const user = request.user as AuthedUser;
    if (!user) {
      throw new UnauthorizedException('Not authorized');
    }

    const projectEntity = await this.projectsService.getProject(
      orgId,
      projectId,
    );

    return !!user.orgMemberships[orgId] && !!projectEntity;
  }
}
