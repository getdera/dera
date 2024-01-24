// This must be imported at the start, before any classes that use class-transformer are imported.
// Hence, importing it at the start of this client file.
import 'reflect-metadata';
import {
  CreateProjectRequest,
  ListProjectsResponse,
  ProjectResponse,
  UpdateProjectRequest,
} from './types/projects';
import {
  makePostRequest,
  makeGetRequest,
  makeDeleteRequest,
  makePutRequest,
} from './utils';
import {
  CreateEmbeddingSchemaRequest,
  EmbeddingSchemaDefaultFieldsResp,
  EmbeddingSchemaResponse,
  ListEmbeddingSchemasResponse,
} from './types/embedding-schema';
import {
  CreateSdkTokenReq,
  CreateSdkTokenResp,
  ListSdkTokensResp,
} from './types/sdk-tokens';
import {
  FetchEmbeddingSchemaDataGetReq,
  FetchEmbeddingSchemaDataGetResp,
} from './types/embeddings';
import {
  ListMatchQueriesResp,
  ListMatchQueryResultResp,
  SearchMatchQueriesFilterReq,
} from './types/embedding-match-queries-results';

export class DeleteSuccessResponse {
  message: string;
}

export async function createProject(
  authToken: string,
  orgId: string,
  createNewProjectRequest: CreateProjectRequest,
): Promise<ProjectResponse> {
  return await makePostRequest<CreateProjectRequest, ProjectResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects`,
    authToken,
    body: createNewProjectRequest,
    respClass: ProjectResponse,
  });
}

export async function updateProject(
  authToken: string,
  orgId: string,
  projectId: string,
  updateProjectRequest: UpdateProjectRequest,
): Promise<ProjectResponse> {
  return await makePutRequest<UpdateProjectRequest, ProjectResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}`,
    authToken,
    body: updateProjectRequest,
    respClass: ProjectResponse,
  });
}
export async function listProjectsInOrg(
  authToken: string,
  orgId: string,
): Promise<ListProjectsResponse> {
  return await makeGetRequest<ListProjectsResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects`,
    authToken,
    respClass: ListProjectsResponse,
  });
}

export async function getProject(
  authToken: string,
  orgId: string,
  projectId: string,
): Promise<ProjectResponse> {
  return await makeGetRequest<ProjectResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}`,
    authToken,
    respClass: ProjectResponse,
  });
}

export async function deleteProject(
  authToken: string,
  orgId: string,
  projectId: string,
): Promise<DeleteSuccessResponse> {
  return await makeDeleteRequest<DeleteSuccessResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}`,
    authToken,
    respClass: DeleteSuccessResponse,
  });
}

export async function listEmbeddingSchemasInProject(
  authToken: string,
  orgId: string,
  projectId: string,
): Promise<ListEmbeddingSchemasResponse> {
  return await makeGetRequest<ListEmbeddingSchemasResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}/embedding-schemas`,
    authToken,
    respClass: ListEmbeddingSchemasResponse,
  });
}

export async function createEmbeddingSchema(
  authToken: string,
  orgId: string,
  projectId: string,
  createEmbeddingSchemaRequest: CreateEmbeddingSchemaRequest,
): Promise<EmbeddingSchemaResponse> {
  return await makePostRequest<
    CreateEmbeddingSchemaRequest,
    EmbeddingSchemaResponse
  >({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}/embedding-schemas`,
    authToken,
    body: createEmbeddingSchemaRequest,
    respClass: EmbeddingSchemaResponse,
  });
}

export async function getEmbeddingSchemaDefaultFields(
  authToken: string,
  orgId: string,
  projectId: string,
): Promise<EmbeddingSchemaDefaultFieldsResp> {
  return await makeGetRequest<EmbeddingSchemaDefaultFieldsResp>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}/embedding-schemas/default-fields`,
    authToken,
    respClass: EmbeddingSchemaDefaultFieldsResp,
  });
}

export async function getEmbeddingSchema(
  authToken: string,
  orgId: string,
  projectId: string,
  embeddingSchemaId: string,
): Promise<EmbeddingSchemaResponse> {
  return await makeGetRequest<EmbeddingSchemaResponse>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}/embedding-schemas/${embeddingSchemaId}`,
    authToken,
    respClass: EmbeddingSchemaResponse,
  });
}

export async function listApiTokensInOrg(
  authToken: string,
  orgId: string,
): Promise<ListSdkTokensResp> {
  return await makeGetRequest<ListSdkTokensResp>({
    endpoint: `/api/v1/orgs/${orgId}/sdk-tokens`,
    authToken,
    respClass: ListSdkTokensResp,
  });
}

export async function createApiToken(
  authToken: string,
  orgId: string,
  body: CreateSdkTokenReq,
): Promise<CreateSdkTokenResp> {
  return await makePostRequest<CreateSdkTokenReq, CreateSdkTokenResp>({
    endpoint: `/api/v1/orgs/${orgId}/sdk-tokens`,
    authToken,
    body,
    respClass: CreateSdkTokenResp,
  });
}

export async function deleteApiToken(
  authToken: string,
  orgId: string,
  tokenId: string,
): Promise<DeleteSuccessResponse> {
  return await makeDeleteRequest<DeleteSuccessResponse>({
    endpoint: `/api/v1/orgs/${orgId}/sdk-tokens/${tokenId}`,
    authToken,
    respClass: DeleteSuccessResponse,
  });
}

export async function fetchEmbeddingSchemaData(
  authToken: string,
  orgId: string,
  projectId: string,
  embeddingSchemaId: string,
  requestParams: FetchEmbeddingSchemaDataGetReq,
): Promise<FetchEmbeddingSchemaDataGetResp> {
  const params = new URLSearchParams(requestParams as any).toString();
  return await makeGetRequest<FetchEmbeddingSchemaDataGetResp>({
    endpoint: `/api/v1/orgs/${orgId}/projects/${projectId}/embedding-schemas/${embeddingSchemaId}/data${
      params ? `?${params}` : ''
    }`,
    authToken,
    respClass: FetchEmbeddingSchemaDataGetResp,
  });
}

export async function listMatchQueriesInSchema(
  authToken: string,
  orgId: string,
  embeddingSchemaId: string,
  page: number = 0,
): Promise<ListMatchQueriesResp> {
  return await makeGetRequest<ListMatchQueriesResp>({
    endpoint: `/api/v1/orgs/${orgId}/embedding-schemas/${embeddingSchemaId}/match-queries?page=${page}`,
    authToken,
    respClass: ListMatchQueriesResp,
  });
}

export async function searchMatchQueries(
  authToken: string,
  orgId: string,
  searchFilters: SearchMatchQueriesFilterReq,
): Promise<ListMatchQueriesResp> {
  const params = new URLSearchParams(searchFilters as any).toString();

  return await makeGetRequest<ListMatchQueriesResp>({
    endpoint: `/api/v1/orgs/${orgId}/search-match-queries${
      params ? `?${params}` : ''
    }`,
    authToken,
    respClass: ListMatchQueriesResp,
  });
}

export async function listMatchResultsForQuery(
  authToken: string,
  orgId: string,
  matchQueryId: string,
): Promise<ListMatchQueryResultResp> {
  return await makeGetRequest<ListMatchQueryResultResp>({
    endpoint: `/api/v1/orgs/${orgId}/match-queries/${matchQueryId}/results`,
    authToken,
    respClass: ListMatchQueryResultResp,
  });
}
