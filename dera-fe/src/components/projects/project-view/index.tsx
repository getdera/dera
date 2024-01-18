'use client';
import { Tabs, Text } from '@mantine/core';
import ProjectSettingsTab from './settings-tab';
import ProjectDangerTab from './danger-tab';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { showErrorNotification } from '../../../lib/utils';
import { getProject } from '../../../lib/dera-client/dera.client';
import { ProjectResponse } from '../../../lib/dera-client/types/projects';
import { useParams } from 'next/navigation';
import ProjectEmbeddingsTab from './embeddings-tab';

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
    <>
      <Text size="xl" fw={500}>
        {project.name}
      </Text>
      <div className="mt-12">
        <Tabs defaultValue="embeddings">
          <Tabs.List>
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
      </div>
    </>
  );
};

export default ProjectView;
