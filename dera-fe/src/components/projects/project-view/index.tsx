'use client';
import { useAuth } from '@clerk/nextjs';
import { Stack, Tabs, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProject } from '../../../lib/dera-client/dera.client';
import { ProjectResponse } from '../../../lib/dera-client/types/projects';
import { showErrorNotification } from '../../../lib/utils';
import ProjectDangerTab from './danger-tab';
import ProjectEmbeddingsTab from './embeddings-tab';
import ProjectSettingsTab from './settings-tab';

const ProjectView = () => {
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectResponse | null>(null);

  const params = useParams<{ orgId: string; projectId: string }>();

  const getProjectReq = async () => {
    try {
      const token = await getToken({
        template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
      });
      if (!token) {
        showErrorNotification(
          'The request was not sent because no auth token was retrieved.',
        );
        return;
      }

      const project = await getProject(token, params.orgId, params.projectId);
      setProject(project);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    getProjectReq().then();
  }, []);

  if (!project) {
    return null;
  }

  return (
    <Stack gap="xl">
      <Text size="xl" fw={500}>
        {project.name}
      </Text>

      <Tabs defaultValue="embeddings" styles={{ panel: { paddingTop: 20 } }}>
        <Tabs.List mb="mb">
          <Tabs.Tab value="embeddings">Embeddings</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
          <Tabs.Tab value="danger">Danger zone</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="embeddings">
          <ProjectEmbeddingsTab project={project} />
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <ProjectSettingsTab
            project={project}
            onProjectUpdated={(project) => {
              setProject(project);
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="danger">
          <ProjectDangerTab orgId={project.orgId} projectId={project.id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default ProjectView;
