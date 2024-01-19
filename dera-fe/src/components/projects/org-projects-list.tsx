'use client';

import { useAuth, useOrganizationList } from '@clerk/nextjs';
import { Button, Flex, Grid, Group, Stack, Text } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { listProjectsInOrg } from '../../lib/dera-client/dera.client';
import { showErrorNotification } from '../../lib/utils';
import classes from './org-projects-list.module.css';

export type OrgProjects = {
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

export type OrgProjectsListState = {
  orgProjects: OrgProjects[];
};

const OrgProjectsList = () => {
  const [orgProjectsList, setOrgProjectsList] = useState<OrgProjectsListState>({
    orgProjects: [],
  });

  const { userMemberships } = useOrganizationList({
    userMemberships: {
      pageSize: 50, // load all at once, don't think a user will be in so many orgs anyway
      infinite: true,
    },
  });

  const { getToken } = useAuth();

  const fetchAndDisplayProjects = async (orgId: string, orgName: string) => {
    const token = await getToken({
      template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
    });

    if (!token) {
      showErrorNotification(
        'The request was not sent because no auth token was retrieved.',
      );
      return;
    }

    try {
      const orgProjects = await listProjectsInOrg(token, orgId);
      const newOrgProjects = {
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
      setOrgProjectsList((orgProjectsList) => ({
        orgProjects: [...orgProjectsList.orgProjects, newOrgProjects],
      }));
    } catch (err) {
      showErrorNotification((err as any)?.message || 'Unknown error.');
    }
  };

  while (userMemberships.hasNextPage) {
    userMemberships.fetchNext();
  }

  useEffect(() => {
    userMemberships.data?.map(async (userMembership) => {
      const displayedOrgs = new Set(
        orgProjectsList.orgProjects.map((op) => op.orgId),
      );
      if (displayedOrgs.has(userMembership.organization.id)) {
        return;
      }
      await fetchAndDisplayProjects(
        userMembership.organization.id,
        userMembership.organization.name,
      );
    });
  }, [userMemberships.data]);

  return (
    <>
      {orgProjectsList.orgProjects.map((orgProjects) => {
        return (
          <React.Fragment key={orgProjects.orgId}>
            <Flex
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
              className="mt-8"
              key={orgProjects.orgId}
            >
              <Text size="lg" fw={500}>
                {orgProjects.orgName}
              </Text>
            </Flex>
            {orgProjects.projects.length ? (
              <Grid className="mt-4">
                {orgProjects.projects.map((project) => {
                  return (
                    <Grid.Col span={{ base: 12, md: 4 }} key={project.id}>
                      <Button
                        component={Link}
                        classNames={{
                          root: classes.projectButtonRoot,
                        }}
                        href={`/orgs/${orgProjects.orgId}/projects/${project.id}`}
                        p="lg"
                        variant="default"
                        w="100%"
                        style={{ minHeight: '200px', overflow: 'auto' }}
                      >
                        <Stack gap={0} w="100%" align="start">
                          <Group
                            justify="space-between"
                            mt="md"
                            mb="xs"
                            wrap="nowrap"
                            w="100%"
                          >
                            <Text fw={500}>{project.name}</Text>
                            <IconArrowNarrowRight className={classes.arrow} />
                          </Group>
                          {project.neonProjectId && (
                            <>
                              <Text size="sm" c="dimmed">
                                Neon project ID:
                              </Text>
                              <Text
                                size="sm"
                                c="dimmed"
                                classNames={{
                                  root: classes.projectName,
                                }}
                              >
                                {project.neonProjectId}
                              </Text>
                            </>
                          )}
                          <Text size="sm" c="dimmed">
                            Created:
                            {project.createdAt.toLocaleDateString()}
                          </Text>
                          <Group justify="space-between" mt="md" mb="xs">
                            &nbsp;
                          </Group>
                        </Stack>
                      </Button>
                    </Grid.Col>
                  );
                })}
              </Grid>
            ) : (
              <Flex justify="center">
                <Text size="sm" c="dimmed">
                  You have not created any projects.
                </Text>
              </Flex>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default OrgProjectsList;
