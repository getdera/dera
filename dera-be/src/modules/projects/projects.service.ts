import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { Repository } from 'typeorm';
import { NeonService } from '../neon/neon.service';
import { SubscriptionsService } from '../subscriptions/abstract-subscriptions.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
    private readonly neonService: NeonService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async createProject(
    orgId: string,
    creatorId: string,
    name: string,
    description: string | null,
  ): Promise<ProjectEntity> {
    const numProjectsInOrg = await this.projectsRepository.count({
      where: {
        orgId,
      },
    });

    const numProjectsIsBelowLimit =
      await this.subscriptionsService.numProjectsIsBelowPlanLimits(
        orgId,
        numProjectsInOrg,
      );

    if (!numProjectsIsBelowLimit) {
      throw new BadRequestException(
        'You have reached your project limit. Please upgrade your subscription to create more projects.',
      );
    }

    const neonProject = await this.neonService.createProject(name);
    if (!neonProject) {
      throw new InternalServerErrorException(
        'Unable to create project with Neon',
      );
    }
    const project = new ProjectEntity();
    project.orgId = orgId;
    project.creatorId = creatorId;
    project.name = name;
    project.description = description;
    project.neonProjectId = neonProject.id;
    return this.projectsRepository.save(project);
  }

  async updateProject(
    orgId: string,
    projectId: string,
    name: string,
    description: string | null,
  ): Promise<ProjectEntity> {
    const projectEntity = await this.getProject(orgId, projectId);
    projectEntity.name = name;
    projectEntity.description = description;
    return this.projectsRepository.save(projectEntity);
  }

  async listProjectsInOrg(orgId: string): Promise<{
    projects: ProjectEntity[];
    projectLimitsReached: boolean;
  }> {
    // if we ever do pagination, the input that we pass in to numProjectsIsBelowPlanLimits() below must be updated
    const projects = await this.projectsRepository.find({
      where: {
        orgId,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    const numProjectsIsBelowLimit =
      await this.subscriptionsService.numProjectsIsBelowPlanLimits(
        orgId,
        projects.length,
      );

    return {
      projects,
      projectLimitsReached: !numProjectsIsBelowLimit,
    };
  }

  async getProject(orgId: string, projectId: string): Promise<ProjectEntity> {
    const projectEntity = await this.projectsRepository.findOne({
      where: {
        orgId,
        id: projectId,
      },
    });

    if (!projectEntity) {
      throw new NotFoundException('Project not found');
    }

    return projectEntity;
  }

  async deleteProject(orgId: string, projectId: string): Promise<void> {
    if (!orgId || !projectId) {
      throw new BadRequestException('Invalid params');
    }

    const projectEntity = await this.getProject(orgId, projectId);

    const deleteFromNeonSuccess = await this.neonService.deleteProject(
      projectEntity.neonProjectId,
    );
    if (!deleteFromNeonSuccess) {
      throw new InternalServerErrorException(
        'Unable to delete project from Neon',
      );
    }

    await this.projectsRepository.delete({
      id: projectEntity.id,
    });
  }
}
