'use client';

import { useAuth } from '@clerk/nextjs';
import { Button, Grid, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { createApiToken } from '../../../lib/dera-client/dera.client';
import { CreateSdkTokenResp } from '../../../lib/dera-client/types/sdk-tokens';
import {
  showErrorNotification,
  showSuccessNotification,
} from '../../../lib/utils';
import LoadingAnimation from '../../projects/project-view/loading-animation';

export type CreateNewTokenFormProps = {
  organizationId: string;
  tokenCreatedCallback?: (createTokenResp: CreateSdkTokenResp) => void;
};

type CreateNewTokenFormFields = {
  name: string;
};

const CreateNewTokenForm = (props: CreateNewTokenFormProps) => {
  const [submitButtonDisabled, setSubmitButtonDisabled] =
    useState<boolean>(false);

  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<CreateNewTokenFormFields>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (value.trim().length > 0 ? null : 'Name is required'),
    },
  });

  const submitNewTokenForm = async (values: CreateNewTokenFormFields) => {
    setIsSubmitting(true);
    setSubmitButtonDisabled(true);

    const token = await getToken({
      template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
    });
    if (!token) {
      showErrorNotification(
        'Unable to send the request because no auth token was retrieved.',
      );
      setSubmitButtonDisabled(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const createTokenResp = await createApiToken(
        token,
        props.organizationId,
        {
          name: values.name,
        },
      );

      showSuccessNotification('Token generated successfully.');

      setSubmitButtonDisabled(false);
      setIsSubmitting(false);

      props.tokenCreatedCallback?.(createTokenResp);
    } catch (err) {
      setSubmitButtonDisabled(false);
      setIsSubmitting(false);

      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  return (
    <div>
      {isSubmitting && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 999,
            width: '100%',
            height: '100%',
            opacity: 0.8,
            backdropFilter: 'blur(8px)',
          }}
        >
          <LoadingAnimation />
        </div>
      )}
      <form onSubmit={form.onSubmit((values) => submitNewTokenForm(values))}>
        <Grid>
          <Grid.Col span={12} className="mb-4">
            <TextInput
              withAsterisk
              label="Token name"
              placeholder="My token"
              autoFocus
              {...form.getInputProps('name')}
            />
          </Grid.Col>
          <Group justify="flex-end" mt="md">
            <Button disabled={submitButtonDisabled} size="xs" type="submit">
              Save
            </Button>
          </Group>
        </Grid>
      </form>
    </div>
  );
};

export default CreateNewTokenForm;
