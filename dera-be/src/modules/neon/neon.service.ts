import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NeonProject, NeonServiceConfig } from './types';
import {
  BranchResponse,
  DatabasesResponse,
  Endpoint,
  EndpointsResponse,
  GeneralError,
  NeonClient,
  ProjectResponse,
  RolesResponse,
} from 'neon-sdk';

@Injectable()
export class NeonService {
  private neonClient: NeonClient;
  private logger = new Logger(NeonService.name);

  constructor(
    @Inject('NEON_SERVICE_CONFIG')
    private readonly neonServiceConfig: NeonServiceConfig,
  ) {
    this.neonClient = new NeonClient({
      TOKEN: this.neonServiceConfig.neonApiKey,
    });
  }

  async createProject(name: string): Promise<NeonProject | null> {
    try {
      const createProjectResponse = await this.neonClient.project.createProject(
        {
          project: {
            name,
          },
        },
      );
      if (isGeneralError(createProjectResponse)) {
        return this.handleGeneralError(
          createProjectResponse,
          'Error calling Neon API to create project',
        );
      }
      return {
        id: createProjectResponse.project.id,
      };
    } catch (err) {
      return this.handleError(err, 'Error calling Neon API to create project');
    }
  }

  async getProject(projectId: string): Promise<ProjectResponse | null> {
    try {
      const getProjectResponse =
        await this.neonClient.project.getProject(projectId);
      if (isGeneralError(getProjectResponse)) {
        return this.handleGeneralError(
          getProjectResponse,
          'Error calling Neon API to get project',
        );
      }
      return getProjectResponse;
    } catch (err) {
      return this.handleError(err, 'Error calling Neon API to get project');
    }
  }

  async deleteProject(projectId: string): Promise<boolean> {
    try {
      await this.neonClient.project.deleteProject(projectId);
      return true;
    } catch (err) {
      this.logger.error({ err }, 'Error calling Neon API to delete project');
      return false;
    }
  }

  async createProjectBranch(
    projectId: string,
    parentBranchId?: string,
  ): Promise<
    | (BranchResponse & EndpointsResponse & RolesResponse & DatabasesResponse)
    | null
  > {
    try {
      const branchResponse = await this.neonClient.branch.createProjectBranch(
        projectId,
        {
          // this must be specified to get an endpoint attached
          endpoints: [
            {
              type: 'read_write',
              // FEAT: make this configurable
              autoscaling_limit_min_cu: 0.5,
              autoscaling_limit_max_cu: 0.5,
              suspend_timeout_seconds: 120,
            },
          ],
          branch: {
            parent_id: parentBranchId,
          },
        },
      );
      if (isGeneralError(branchResponse)) {
        return this.handleGeneralError(
          branchResponse,
          'Error calling Neon API to create project branch',
        );
      }
      return branchResponse;
    } catch (err) {
      return this.handleError(err, 'Error calling Neon API to create branch');
    }
  }

  async getRolePassword(
    projectId: string,
    branchId: string,
    roleName: string,
  ): Promise<string | null> {
    try {
      const rolePasswordResponse =
        await this.neonClient.branch.getProjectBranchRolePassword(
          projectId,
          branchId,
          roleName,
        );
      if (isGeneralError(rolePasswordResponse)) {
        return this.handleGeneralError(
          rolePasswordResponse,
          'Error calling Neon API to get role password',
        );
      }
      return rolePasswordResponse.password;
    } catch (err) {
      return this.handleError(
        err,
        'Error calling Neon API to get role password',
      );
    }
  }

  private handleError(err: any, logMessage: string): null {
    const errBody = err?.body;
    if (isGeneralError(errBody)) {
      return this.handleGeneralError(errBody, logMessage);
    } else {
      this.logger.error({ err }, logMessage);
      return null;
    }
  }

  private handleGeneralError(err: GeneralError, logMessage: string): null {
    if (err.code === 'PROJECTS_LIMIT_EXCEEDED') {
      throw new BadRequestException(err.message);
    }
    this.logger.error({ err }, logMessage);
    return null;
  }
}

function isGeneralError(val: any): val is GeneralError {
  return val?.code !== undefined && val?.message !== undefined;
}
