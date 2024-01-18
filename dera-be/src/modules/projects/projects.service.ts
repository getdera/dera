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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectsRepository: Repository<ProjectEntity>,
    private readonly neonService: NeonService,
  ) {}

  async createProject(
    orgId: string,
    creatorId: string,
    name: string,
    description: string | null,
  ): Promise<ProjectEntity> {
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

  async listProjectsInOrg(orgId: string): Promise<ProjectEntity[]> {
    return this.projectsRepository.find({
      where: {
        orgId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
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
