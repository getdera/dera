import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthedRequest } from '../auth/types';
import { OrgMembershipGuard } from '../auth/org-membership.guard';
import { projectEntityToProjectResponse } from './utils';
import {
  CreateProjectRequest,
  ListProjectsResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from './types';

@UseGuards(OrgMembershipGuard)
@Controller('orgs/:orgId/projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject('DERA_SHOW_NEON_IDS_IN_API')
    private readonly showNeonIdsInApi: boolean,
  ) {}

  @Post()
  async createProject(
    @Param('orgId') orgId: string,
    @Request() req: AuthedRequest,
    @Body() createProjectReq: CreateProjectRequest,
  ): Promise<ProjectResponse> {
    const projectEntity = await this.projectsService.createProject(
      orgId,
      req.user.id,
      createProjectReq.name,
      createProjectReq.description,
    );

    return projectEntityToProjectResponse(projectEntity, this.showNeonIdsInApi);
  }

  @Put(':projectId')
  async updateProject(
    @Param('orgId') orgId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() updateProjectReq: UpdateProjectRequest,
  ): Promise<ProjectResponse> {
    const projectEntity = await this.projectsService.updateProject(
      orgId,
      projectId,
      updateProjectReq.name,
      updateProjectReq.description,
    );

    return projectEntityToProjectResponse(projectEntity, this.showNeonIdsInApi);
  }

  @Get()
  async listProjectsInOrg(
    @Param('orgId') orgId: string,
  ): Promise<ListProjectsResponse> {
    const res = await this.projectsService.listProjectsInOrg(orgId);

    return {
      projects: res.projects.map((pe) =>
        projectEntityToProjectResponse(pe, this.showNeonIdsInApi),
      ),
      projectLimitsReached: res.projectLimitsReached,
    };
  }

  @Get(':projectId')
  async getProject(
    @Param('orgId') orgId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<ProjectResponse> {
    const projectEntity = await this.projectsService.getProject(
      orgId,
      projectId,
    );

    return projectEntityToProjectResponse(projectEntity, this.showNeonIdsInApi);
  }

  @Delete(':projectId')
  async deleteProject(
    @Param('orgId') orgId: string,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ): Promise<{ message: 'ok' }> {
    await this.projectsService.deleteProject(orgId, projectId);

    return {
      message: 'ok',
    };
  }
}
