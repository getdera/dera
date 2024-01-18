'use client';

import { Button, Grid, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { deleteProject } from '../../../lib/dera-client/dera.client';
import { useAuth } from '@clerk/nextjs';
import { showErrorNotification } from '../../../lib/utils';
import { useRouter } from 'next/navigation';

export type ProjectDangerTabProps = {
  orgId: string;
  projectId: string;
};

const ProjectDangerTab = ({ orgId, projectId }: ProjectDangerTabProps) => {
  const { getToken } = useAuth();
  const { push } = useRouter();

  const openModal = () => {
    modals.openConfirmModal({
      title: 'Delete project',
      children: (
        <Text size="sm">
          Are you sure that you want to delete this project? All data in this
          project will be deleted. This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete project', cancel: 'Cancel' },
      onConfirm: sendDeleteProjectReq,
      confirmProps: { color: 'red' },
    });
  };

  const sendDeleteProjectReq = async () => {
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
      await deleteProject(token, orgId, projectId);
      push('/dashboard');
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  return (
    <Grid className="mt-4">
      <Grid.Col span={12}>
        <Button color="red" size="sm" onClick={openModal}>
          Delete project
        </Button>
        <Text size="sm" c="dimmed">
          This will delete all data in this project.
        </Text>
      </Grid.Col>
    </Grid>
  );
};

export default ProjectDangerTab;
