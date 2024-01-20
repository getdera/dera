import { listProjectsInOrg } from '@/lib/dera-client/dera.client';
import { useAuth } from '@clerk/nextjs';
import { OrganizationResource } from '@clerk/types';
import { useQueries } from 'react-query';

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
  const { getToken } = useAuth();

  const queries = useQueries(
    orgs.map((org) => {
      return {
        queryKey: ['orgProjects', org.id],
        queryFn: async () => {
          const token = await getToken({
            template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
          });

          if (!token) {
            throw new Error(
              'The request was not sent because no auth token was retrieved.',
            );
          }

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
