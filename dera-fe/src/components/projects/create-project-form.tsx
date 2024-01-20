'use client';

import { useAuth } from '@clerk/nextjs';
import { Button, Group, Paper, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createProject } from '../../lib/dera-client/dera.client';
import { showErrorNotification } from '../../lib/utils';
import { projectDetailsValidation } from './validations';

export type CreateProjectFormProps = {
  org: { id: string; name: string };
};

type CreateProjectFormValues = {
  name: string;
  description: string;
  orgName: string;
  orgId: string;
};

const CreateProjectForm = ({ org }: CreateProjectFormProps) => {
  const { getToken } = useAuth();
  const { push } = useRouter();
  const [submitButtonDisabled, setSubmitButtonDisabled] =
    useState<boolean>(false);

  const submitCreateProject = async (values: CreateProjectFormValues) => {
    setSubmitButtonDisabled(true);
    const token = await getToken({
      template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
    });

    if (!token) {
      setSubmitButtonDisabled(false);
      showErrorNotification(
        'The request was not sent because no auth token was retrieved.',
      );
      return;
    }

    try {
      const projectCreated = await createProject(token, values.orgId, {
        name: values.name,
        description: values.description.trim() || null,
      });
      push(`/orgs/${projectCreated.orgId}/projects/${projectCreated.id}`);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
      setSubmitButtonDisabled(false);
    }
  };

  const form = useForm<CreateProjectFormValues>({
    initialValues: {
      name: '',
      description: '',
      orgName: org.name,
      orgId: org.id,
    },
    validate: {
      ...projectDetailsValidation,
      orgId: (value) => (value !== org.id ? 'Organization ID mismatch' : null),
    },
  });

  return (
    <Paper withBorder p="xl">
      <form onSubmit={form.onSubmit((values) => submitCreateProject(values))}>
        <Stack>
          <b>Create a new project</b>

          <TextInput
            label="Organization name"
            disabled
            {...form.getInputProps('orgName')}
          />

          <TextInput
            withAsterisk
            label="Project name"
            placeholder="The Next Big Thing"
            autoFocus
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Project description"
            placeholder="An optional but helpful description of your project."
            {...form.getInputProps('description')}
          />

          <Group justify="end">
            <Button disabled={submitButtonDisabled} size="xs" type="submit">
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateProjectForm;
