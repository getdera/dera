'use client';

import { useAuth } from '@clerk/nextjs';
import { Button, Grid, Group, Input, Paper, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { createProject } from '../../lib/dera-client/dera.client';
import { showErrorNotification } from '../../lib/utils';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    <Paper withBorder className="px-6 py-6">
      <form onSubmit={form.onSubmit((values) => submitCreateProject(values))}>
        <Grid>
          <Grid.Col span={12} className="mb-4">
            <b>Create a new project</b>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={12} className="mb-4">
            <TextInput
              label="Organization name"
              disabled
              {...form.getInputProps('orgName')}
            />
          </Grid.Col>
        </Grid>
        <Input disabled type="hidden" {...form.getInputProps('orgId')} />
        <Grid>
          <Grid.Col span={12} className="mb-4">
            <TextInput
              withAsterisk
              label="Project name"
              placeholder="The Next Big Thing"
              autoFocus
              {...form.getInputProps('name')}
            />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={12} className="mb-4">
            <TextInput
              label="Project description"
              placeholder="An optional but helpful description of your project."
              {...form.getInputProps('description')}
            />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="md">
          <Button disabled={submitButtonDisabled} size="xs" type="submit">
            Submit
          </Button>
        </Group>
      </form>
    </Paper>
  );
};

export default CreateProjectForm;
