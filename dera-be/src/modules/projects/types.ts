import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateProjectRequest {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;
}

export class UpdateProjectRequest {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;
}

export class ProjectResponse {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  neonProjectId?: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  @IsString()
  orgId: string;

  @IsString()
  creatorId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;
}

export class ListProjectsResponse {
  @ValidateNested({ each: true })
  @Type(() => ProjectResponse)
  projects: ProjectResponse[];
}
