import {
  listEmbeddingSchemasInProject,
  listProjectsInOrg,
} from '@/lib/dera-client/dera.client';
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

function validateToken(token: string | null): asserts token is string {
  if (!token) {
    throw new Error(
      'The request was not sent because no auth token was retrieved.',
    );
  }
}
