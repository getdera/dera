import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
  IsPositive,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { PG_DATA_TYPES, PG_VECTOR_TYPES } from './pg-data-types';
import { IsPostgresIdentifier } from '../../utils/validators';

export class CreateEmbeddingSchemaFieldRequest {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsPostgresIdentifier()
  name: string;

  @IsString()
  @IsIn(PG_DATA_TYPES)
  datatype: string;

  @IsOptional()
  @IsString()
  defaultValue: string | null;

  @IsBoolean()
  isNullable: boolean;

  @IsBoolean()
  isUnique: boolean;

  @ValidateIf((obj) => PG_VECTOR_TYPES.includes(obj.datatype))
  @IsOptional()
  @IsPositive()
  @IsInt()
  vectorLength?: number;
}

export class CreateEmbeddingSchemaRequest {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsPostgresIdentifier()
  name: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  @IsPositive()
  @IsInt()
  embeddingVectorLength?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEmbeddingSchemaFieldRequest)
  fields: CreateEmbeddingSchemaFieldRequest[];
}

export class EmbeddingSchemaFieldResponse {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  embeddingSchemaId: string;

  name: string;

  @IsString()
  @IsIn(PG_DATA_TYPES)
  datatype: string;

  defaultValue: string | null;

  isNullable: boolean;

  isUnique: boolean;

  isPrimaryKey: boolean;

  vectorLength: number | null;
}

export class EmbeddingSchemaResponse {
  id: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  projectId: string;

  creatorId: string;
  name: string;

  description: string | null;

  @IsArray()
  @Type(() => EmbeddingSchemaFieldResponse)
  fields: EmbeddingSchemaFieldResponse[];
}

export class ListEmbeddingSchemasResponse {
  embeddingSchemas: EmbeddingSchemaResponse[];
}

export type NeonDetailsDto = {
  neonProjectId: string;
  neonRoleName: string;
  neonEndpointId: string;
  neonEndpointHost: string;
  neonBranchId: string;
  neonBranchName: string;
  neonBranchParentId: string;
  neonDatabaseId: number;
  neonDatabaseName: string;
  embeddingTableName: string;
};

export type NeonDetailsWithPasswordDto = NeonDetailsDto & {
  neonRolePassword: string;
};
