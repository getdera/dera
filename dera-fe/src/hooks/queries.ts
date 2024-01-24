import {
  listEmbeddingSchemasInProject,
  listMatchResultsForQuery,
  listProjectsInOrg,
  searchMatchQueries,
} from '@/lib/dera-client/dera.client';
import {
  MatchQueryResp,
  SearchMatchQueriesFilterReq,
} from '@/lib/dera-client/types/embedding-match-queries-results';
import { OrganizationResource } from '@clerk/types';
import { useQueries, useQuery } from 'react-query';
import { useGetAuthToken } from './common';

type OrgProjects = {
  orgName: string;
  orgId: string;
  projects: {
    id: string;
    neonProjectId?: string;
    name: string;
    description: string | null;
    createdAt: Date;
  }[];
};

export function useOrgProjects({
  orgs,
  onError,
}: {
  orgs: OrganizationResource[];
  onError?: (error: unknown) => void;
}) {
  const { getAuthToken } = useGetAuthToken();

  const queries = useQueries(
    orgs.map((org) => {
      return {
        queryKey: ['orgProjects', org.id],
        queryFn: async () => {
          const token = await getAuthToken();

          validateToken(token);

          const { id: orgId, name: orgName } = org;

          const orgProjects = await listProjectsInOrg(token, orgId);

          const newOrgProjects: OrgProjects = {
            orgName,
            orgId,
            projects: orgProjects.projects.map((project) => ({
              id: project.id,
              neonProjectId: project.neonProjectId,
              name: project.name,
              description: project.description,
              createdAt: project.createdAt,
            })),
          };

          return newOrgProjects;
        },
        onError,
      };
    }),
  );

  const orgProjects = queries
    .map((query) => {
      return query.data;
    })
    .filter((data): data is OrgProjects => !!data);

  const orgProjectsIsLoading = queries.map((query) => query.isLoading);

  return {
    orgProjects,
    orgProjectsIsLoading,
  };
}

export function useEmbeddingSchemasList({
  project,
  onError,
}: {
  project: { id: string; orgId: string };
  onError: (error: unknown) => void;
}) {
  const { getAuthToken } = useGetAuthToken();

  const { data, isLoading } = useQuery({
    queryKey: ['embedding-schemas-list', project],
    queryFn: async () => {
      const token = await getAuthToken();

      validateToken(token);

      return listEmbeddingSchemasInProject(token, project.orgId, project.id);
    },
    onError,
  });

  return {
    embeddingSchemasList: data?.embeddingSchemas || [],
    isLoadingEmbeddingSchemasList: isLoading,
  };
}

export function useSearchMatchQueries({
  orgId,
  searchFilters,
  onError,
}: {
  orgId: string;
  searchFilters: SearchMatchQueriesFilterReq;
  onError: (error: unknown) => void;
}) {
  const { getAuthToken } = useGetAuthToken();

  const { data, isLoading } = useQuery({
    queryKey: ['search-match-queries', orgId, searchFilters],
    queryFn: async () => {
      const token = await getAuthToken();

      validateToken(token);

      return searchMatchQueries(token, orgId, searchFilters);
    },
    onError,
  });

  return {
    matchedQueries: data?.queries || [],
    isLoadingMatchedQueries: isLoading,
  };
}

export function useMatchResultsForQuery({
  matchQuery,
  onError,
}: {
  matchQuery: MatchQueryResp;
  onError: (error: unknown) => void;
}) {
  const { getAuthToken } = useGetAuthToken();

  const { data, isLoading } = useQuery({
    queryKey: ['match-results-for-query', matchQuery.id],
    queryFn: async () => {
      const token = await getAuthToken();

      validateToken(token);

      return listMatchResultsForQuery(token, matchQuery.orgId, matchQuery.id);
    },
    onError,
  });

  return {
    matchedQueryResults: data?.results || [],
    isLoadingMatchedQueryResults: isLoading,
  };
}

function validateToken(token: string | null): asserts token is string {
  if (!token) {
    throw new Error(
      'The request was not sent because no auth token was retrieved.',
    );
  }
}
