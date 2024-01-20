'use client';

import { useGetAuthToken } from '@/hooks/common';
import { Button, Table, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { updateProject } from '../../../lib/dera-client/dera.client';
import { ProjectResponse } from '../../../lib/dera-client/types/projects';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../lib/utils';
import { projectDetailsValidation } from '../validations';

export type ProjectSettingsTabProps = {
  project: ProjectResponse;
  onProjectUpdated: (project: ProjectResponse) => void;
};

type UpdateProjectFormValues = {
  id: string;
  neonProjectId?: string;
  name: string;
  description: string;
};

const ProjectSettingsTab = (props: ProjectSettingsTabProps) => {
  const [project, setProject] = useState<ProjectResponse>(props.project);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState<boolean>(false);

  const { getAuthToken } = useGetAuthToken();
  const form = useForm<UpdateProjectFormValues>({
    initialValues: {
      id: project.id,
      neonProjectId: project.neonProjectId,
      name: project.name,
      description: project.description || '',
    },
    validate: {
      ...projectDetailsValidation,
    },
  });

  const submitUpdateProject = async (values: UpdateProjectFormValues) => {
    setSaveButtonDisabled(true);
    const token = await getAuthToken();

    if (!token) {
      setSaveButtonDisabled(false);
      showErrorNotification(
        'The request was not sent because no auth token was retrieved.',
      );
      return;
    }

    try {
      const projectUpdated = await updateProject(
        token,
        project.orgId,
        values.id,
        {
          name: values.name,
          description: values.description.trim() || null,
        },
      );
      setProject(projectUpdated);
      showSuccessNotification('Project details updated successfully.');
      props.onProjectUpdated(projectUpdated);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }

    setSaveButtonDisabled(false);
  };

  return (
    <form onSubmit={form.onSubmit((values) => submitUpdateProject(values))}>
      <Table withTableBorder verticalSpacing="md">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td width="25%">
              <Text fw={700}>Project ID</Text>
            </Table.Td>
            <Table.Td>
              <TextInput disabled {...form.getInputProps('id')} />
            </Table.Td>
          </Table.Tr>
          {form.values.neonProjectId && (
            <Table.Tr>
              <Table.Td>
                <Text fw={700}>Neon ID</Text>
              </Table.Td>
              <Table.Td>
                <TextInput disabled {...form.getInputProps('neonProjectId')} />
              </Table.Td>
            </Table.Tr>
          )}
          <Table.Tr>
            <Table.Td>
              <Text fw={700}>Name</Text>
            </Table.Td>
            <Table.Td>
              <TextInput {...form.getInputProps('name')} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>
              <Text fw={700}>Description</Text>
            </Table.Td>
            <Table.Td>
              <TextInput {...form.getInputProps('description')} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={2} align="right">
              {/* FEAT: add a reset button to reset to initial values and also enable submit button only when any values changed. */}
              <Button size="xs" type="submit" disabled={saveButtonDisabled}>
                Save changes
              </Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </form>
  );
};

export default ProjectSettingsTab;
