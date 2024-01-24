'use client';

import { useEmbeddingSchemasList } from '@/hooks/queries';
import { Button, Card, Drawer, Flex, Grid, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import Link from 'next/link';
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
  const { embeddingSchemasList } = useEmbeddingSchemasList({
    project,
    onError: (err) => {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    },
  });

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

  if (!embeddingSchemasList.length) {
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
          {embeddingSchemasList.map((embeddingSchema) => {
            return (
              <Grid.Col span={{ base: 12, md: 4 }} key={embeddingSchema.id}>
                <Button
                  component={Link}
                  classNames={{
                    root: classes.embeddingSchemaButton,
                    label: classes.label,
                  }}
                  href={`/orgs/${project.orgId}/projects/${project.id}/embedding-schemas/${embeddingSchema.id}`}
                  p="lg"
                  radius="md"
                  style={{ minHeight: '200px', overflow: 'auto' }}
                  variant="default"
                  w="100%"
                >
                  <Stack
                    gap={4}
                    align="start"
                    justify="start"
                    h="100%"
                    w="100%"
                  >
                    <IconArrowNarrowRight
                      className={classes.arrow}
                      size="1rem"
                    />
                    <Text component="div" fw={500} className="ellipsis">
                      {embeddingSchema.name}
                    </Text>
                    {embeddingSchema.description && (
                      <Text
                        component="div"
                        style={{ whiteSpace: 'normal' }}
                        c="dimmed"
                      >
                        {embeddingSchema.description}
                      </Text>
                    )}
                    <Text component="div" size="sm" c="dimmed">
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
