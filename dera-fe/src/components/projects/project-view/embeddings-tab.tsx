'use client';

import { useAuth } from '@clerk/nextjs';
import { Button, Card, Drawer, Flex, Grid, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listEmbeddingSchemasInProject } from '../../../lib/dera-client/dera.client';
import { EmbeddingSchemaResponse } from '../../../lib/dera-client/types/embedding-schema';
import { ProjectResponse } from '../../../lib/dera-client/types/projects';
import { showErrorNotification } from '../../../lib/utils';
import CreateEmbeddingSchemaForm from './create-embedding-schema-form';
import classes from './embeddings-tab.module.css';

export type ProjectEmbeddingsTabProps = {
  project: ProjectResponse;
};

const ProjectEmbeddingsTab = (
  projectEmbeddingsTabProps: ProjectEmbeddingsTabProps,
) => {
  const { project } = projectEmbeddingsTabProps;
  const [opened, { open, close }] = useDisclosure(false);
  const { getToken } = useAuth();

  const [embeddingSchemas, setEmbeddingSchemas] = useState<
    EmbeddingSchemaResponse[]
  >([]);

  const getProjectEmbeddingSchemas = async () => {
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
      const listEmbeddingSchemasResponse = await listEmbeddingSchemasInProject(
        token,
        project.orgId,
        project.id,
      );
      setEmbeddingSchemas(listEmbeddingSchemasResponse.embeddingSchemas);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    getProjectEmbeddingSchemas().then();
  }, []);

  const createEmbeddingSchemaDrawer = (
    <Drawer
      opened={opened}
      onClose={close}
      title={
        <>
          Create Embedding Schema in <b>{project.name}</b>
        </>
      }
      position="right"
      size="xl"
    >
      <CreateEmbeddingSchemaForm project={project} />
    </Drawer>
  );

  let mainComponent = <></>;

  if (!embeddingSchemas.length) {
    mainComponent = (
      <Flex justify="center">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed">
            You have not created any embedding schemas.
          </Text>

          <Button color="blue" fullWidth mt="md" size="xs" onClick={open}>
            Start creating
          </Button>
        </Card>
      </Flex>
    );
  } else {
    mainComponent = (
      <>
        <Button size="xs" onClick={open}>
          New embedding schema
        </Button>
        <Grid className="mt-4">
          {embeddingSchemas.map((embeddingSchema) => {
            return (
              <Grid.Col span={{ base: 12, md: 4 }} key={embeddingSchema.id}>
                <Button
                  component={Link}
                  classNames={{
                    root: classes.embeddingSchemaButton,
                  }}
                  href={`/orgs/${project.orgId}/projects/${project.id}/embedding-schemas/${embeddingSchema.id}`}
                  p="lg"
                  radius="md"
                  style={{ minHeight: '200px', overflow: 'auto' }}
                  variant="default"
                >
                  <Stack gap={4} align="flex-start" justify="start" h="100%">
                    <IconArrowNarrowRight
                      className={classes.arrow}
                      size="1rem"
                    />
                    <Text fw={500}>{embeddingSchema.name}</Text>
                    {embeddingSchema.description && (
                      <Text c="dimmed">{embeddingSchema.description}</Text>
                    )}
                    <Text size="sm" c="dimmed">
                      Created:
                      {embeddingSchema.createdAt.toLocaleDateString()}
                    </Text>
                  </Stack>
                </Button>
              </Grid.Col>
            );
          })}
        </Grid>
      </>
    );
  }

  return (
    <div>
      {createEmbeddingSchemaDrawer}
      {mainComponent}
    </div>
  );
};

export default ProjectEmbeddingsTab;
