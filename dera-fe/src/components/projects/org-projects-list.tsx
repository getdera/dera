'use client';

import { useOrgProjects } from '@/hooks/queries';
import { useOrganizationList } from '@clerk/nextjs';
import { Button, Flex, Grid, Group, Stack, Text } from '@mantine/core';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';
import { showErrorNotification } from '../../lib/utils';
import classes from './org-projects-list.module.css';

const OrgProjectsList = () => {
  const { userMemberships } = useOrganizationList({
    userMemberships: {
      pageSize: 50, // load all at once, don't think a user will be in so many orgs anyway
      infinite: true,
    },
  });

  const orgs =
    userMemberships?.data?.map((userMembership) => {
      return userMembership.organization;
    }) || [];

  const { orgProjects } = useOrgProjects({
    orgs,
    onError(error) {
      showErrorNotification((error as any)?.message || 'Unknown error.');
    },
  });

  while (userMemberships.hasNextPage) {
    userMemberships.fetchNext();
  }

  return (
    <Stack gap="xs">
      {orgProjects.map((orgProjectsData) => {
        return (
          <React.Fragment key={orgProjectsData.orgId}>
            <Flex
              justify="flex-start"
              align="flex-start"
              direction="row"
              wrap="wrap"
              key={orgProjectsData.orgId}
            >
              <Text size="lg" fw={500}>
                {orgProjectsData.orgName}
              </Text>
            </Flex>
            {orgProjectsData.projects.length ? (
              <Grid>
                {orgProjectsData.projects.map((project) => {
                  return (
                    <Grid.Col span={{ base: 12, md: 4 }} key={project.id}>
                      <Button
                        component={Link}
                        classNames={{
                          root: classes.projectButtonRoot,
                          label: classes.projectButtonRootLabel,
                        }}
                        href={`/orgs/${orgProjectsData.orgId}/projects/${project.id}`}
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
                                ta="left"
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
    </Stack>
  );
};

export default OrgProjectsList;
