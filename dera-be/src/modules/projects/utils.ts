import { ProjectEntity } from './project.entity';
import { ProjectResponse } from './types';

export function projectEntityToProjectResponse(
  projectEntity: ProjectEntity,
  showNeonProjectId: boolean,
): ProjectResponse {
  return {
    id: projectEntity.id,
    neonProjectId: showNeonProjectId ? projectEntity.neonProjectId : undefined,
    createdAt: projectEntity.createdAt,
    updatedAt: projectEntity.updatedAt,
    orgId: projectEntity.orgId,
    creatorId: projectEntity.creatorId,
    name: projectEntity.name,
    description: projectEntity.description,
  };
}
