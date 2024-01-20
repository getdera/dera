'use client';

import { useGetAuthToken } from '@/hooks/common';
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconHelpCircleFilled, IconTrashFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  createEmbeddingSchema,
  getEmbeddingSchemaDefaultFields,
} from '../../../lib/dera-client/dera.client';
import {
  CreateEmbeddingSchemaFieldRequest,
  CreateEmbeddingSchemaRequest,
  EmbeddingSchemaDefaultFieldsResp,
} from '../../../lib/dera-client/types/embedding-schema';
import { ProjectResponse } from '../../../lib/dera-client/types/projects';
import { PG_DATA_TYPES, PG_VECTOR_TYPES } from '../../../lib/pg-data-types';
import {
  isValidPostgresIdentifier,
  showErrorNotification,
  showSuccessNotification,
} from '../../../lib/utils';
import LoadingAnimation from './loading-animation';

export type CreateEmbeddingSchemaFormProps = {
  project: ProjectResponse;
};

type CreateEmbeddingSchemaCustomFieldFormFields = Omit<
  CreateEmbeddingSchemaFieldRequest,
  'vectorLength' | 'defaultValue'
> & {
  vectorLength: string;
  hasDefaultValue: boolean;
  defaultValue: string;
};

type CreateEmbeddingSchemaFormFields = Omit<
  CreateEmbeddingSchemaRequest,
  'embeddingVectorLength' | 'fields'
> & {
  embeddingVectorLength: string;
  fields: CreateEmbeddingSchemaCustomFieldFormFields[];
};

const CreateEmbeddingSchemaForm = (
  createEmbeddingSchemaFormProps: CreateEmbeddingSchemaFormProps,
) => {
  const { project } = createEmbeddingSchemaFormProps;

  const { getAuthToken } = useGetAuthToken();
  const { push } = useRouter();

  const [defaultFields, setDefaultFields] =
    useState<EmbeddingSchemaDefaultFieldsResp | null>(null);

  const [submitButtonDisabled, setSubmitButtonDisabled] =
    useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<CreateEmbeddingSchemaFormFields>({
    initialValues: {
      name: '',
      description: '',
      embeddingVectorLength: '',
      fields: [],
    },
    validate: {
      name: (value) =>
        isValidPostgresIdentifier(value)
          ? null
          : 'Name is required and must be a valid Postgres identifier',
      description: (value) => null,
      embeddingVectorLength: (value) =>
        value.trim().length === 0 || parseInt(value) > 0
          ? null
          : 'Embedding vector length must be a postitive integer',
      fields: {
        name: (value) =>
          isValidPostgresIdentifier(value)
            ? null
            : 'Name is required and must be a valid Postgres identifier',
        datatype: (value) =>
          PG_DATA_TYPES.includes(value) ? null : 'Invalid data type',
        isNullable: (value) => null,
        isUnique: (value) => null,
        vectorLength: (value) =>
          value.trim().length === 0 || parseInt(value) > 0
            ? null
            : 'Vector length must be a postitive integer',
        defaultValue: (value) => null,
      },
    },
  });

  const getDefaultFields = async () => {
    const token = await getAuthToken();
    if (!token) {
      setDefaultFields(null);
      showErrorNotification(
        'Unable to retrieve default fields because no auth token was retrieved.',
      );
      return;
    }

    try {
      const resp = await getEmbeddingSchemaDefaultFields(
        token,
        project.orgId,
        project.id,
      );
      setDefaultFields(resp);
    } catch (err) {
      setDefaultFields(null);
      showErrorNotification(
        (err as any)?.message ||
          'An error occurred while fetching default fields.',
      );
    }
  };

  const submitEmbeddingSchemaValues = async (
    values: CreateEmbeddingSchemaFormFields,
  ) => {
    setIsSubmitting(true);
    setSubmitButtonDisabled(true);

    const token = await getAuthToken();
    if (!token) {
      showErrorNotification(
        'Unable to send the request because no auth token was retrieved.',
      );
      setSubmitButtonDisabled(false);
      setIsSubmitting(false);
      return;
    }

    try {
      const createEmbeddingSchemaRequest: CreateEmbeddingSchemaRequest = {
        name: values.name,
        description: values.description,
        embeddingVectorLength:
          values.embeddingVectorLength.trim().length === 0
            ? undefined
            : parseInt(values.embeddingVectorLength),
        fields: values.fields.map((field) => ({
          name: field.name,
          datatype: field.datatype,
          isNullable: field.isNullable,
          isUnique: field.isUnique,
          vectorLength:
            field.vectorLength.trim().length === 0
              ? undefined
              : parseInt(field.vectorLength),
          defaultValue: field.hasDefaultValue ? field.defaultValue : null,
        })),
      };

      const embeddingSchemaResponse = await createEmbeddingSchema(
        token,
        project.orgId,
        project.id,
        createEmbeddingSchemaRequest,
      );

      showSuccessNotification('Embedding schema created successfully.');

      push(
        `/orgs/${project.orgId}/projects/${project.id}/embedding-schemas/${embeddingSchemaResponse.id}`,
      );

      setSubmitButtonDisabled(false);
      setIsSubmitting(false);
    } catch (err) {
      setSubmitButtonDisabled(false);
      setIsSubmitting(false);

      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  const addCustomField = () => {
    form.setValues((values) => ({
      ...values,
      fields: [
        ...(values.fields || []),
        {
          name: '',
          datatype: '',
          isNullable: false,
          isUnique: false,
          vectorLength: '',
          hasDefaultValue: false,
          defaultValue: '',
        },
      ],
    }));
  };

  const removeFieldAtIndex = (fieldIndex: number) => {
    form.setValues((values) => ({
      ...values,
      fields: (values.fields || []).filter((_, index) => index !== fieldIndex),
    }));
  };

  useEffect(() => {
    getDefaultFields().then();
  }, []);

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
            background: 'white',
            opacity: 0.8,
          }}
        >
          <LoadingAnimation />
        </div>
      )}
      <form
        onSubmit={form.onSubmit((values) =>
          submitEmbeddingSchemaValues(values),
        )}
      >
        <Stack gap="xs">
          <TextInput
            withAsterisk
            label="Schema name"
            placeholder="books_embeddings_with_my_llm"
            autoFocus
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Description"
            placeholder="An optional but helpful description of your schema."
            {...form.getInputProps('description')}
          />

          <Box my="md">
            <Title order={4}>Fields</Title>
            <Text>
              Every schema comes with a list of default fields. You can add more
              fields to your schema below.
            </Text>
          </Box>

          <Title order={5}>Default fields</Title>

          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, sm: 1 }} pt="lg">
              &nbsp;
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>Name</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>Type</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }}>Properties</Grid.Col>
          </Grid>

          <Stack gap={8}>
            {defaultFields?.fields?.map((field) => (
              <Grid gutter="sm" key={field.name}>
                <Grid.Col span={{ base: 12, sm: 1 }}>
                  <Tooltip label={field.description} multiline w={250}>
                    <IconHelpCircleFilled
                      style={{ width: rem(20), height: rem(20) }}
                    />
                  </Tooltip>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <TextInput disabled value={field.name} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <Autocomplete disabled value={field.datatype} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 2 }}>
                  <Checkbox
                    disabled
                    checked={field.isNullable}
                    label="Is Nullable"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 3 }}>
                  <Checkbox
                    disabled
                    checked={field.isPrimaryKey}
                    label="Is Primary Key"
                  />
                </Grid.Col>
              </Grid>
            )) || <Text>An error occurred while fetching default fields.</Text>}
          </Stack>

          <Title my="md" order={5}>
            Customization
          </Title>

          <TextInput
            label="Embedding vector length"
            placeholder="Length for the default embeddings field (optional). Will be set to 1536 if left empty."
            {...form.getInputProps('embeddingVectorLength')}
          />

          <Title order={6} my="md">
            Custom fields
          </Title>

          <Grid gutter="xs">
            <Grid.Col span={{ base: 12, sm: 1 }}>&nbsp;</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>Name</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>Type</Grid.Col>
            <Grid.Col span={{ base: 12, sm: 5 }}>Properties</Grid.Col>
          </Grid>

          {form.values.fields.map((field, index) => (
            <Grid gutter="sm" key={index}>
              <Grid.Col span={{ base: 12, sm: 1 }}>
                <ActionIcon
                  size="sm"
                  color="red"
                  onClick={() => removeFieldAtIndex(index)}
                >
                  <IconTrashFilled size="0.8rem" />
                </ActionIcon>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <TextInput
                  withAsterisk
                  placeholder="Name"
                  {...form.getInputProps(`fields.${index}.name`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                <Autocomplete
                  withAsterisk
                  placeholder="Type or select"
                  data={PG_DATA_TYPES.map((dt) => ({
                    value: dt,
                    label: dt,
                  }))}
                  {...form.getInputProps(`fields.${index}.datatype`)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 2 }}>
                <Checkbox
                  label="Is Nullable"
                  {...form.getInputProps(`fields.${index}.isNullable`, {
                    type: 'checkbox',
                  })}
                />
                <Checkbox
                  label="Is Unique"
                  {...form.getInputProps(`fields.${index}.isUnique`, {
                    type: 'checkbox',
                  })}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 3 }}>
                {PG_VECTOR_TYPES.includes(field.datatype) && (
                  <TextInput
                    placeholder="Optional vector length"
                    {...form.getInputProps(`fields.${index}.vectorLength`)}
                  />
                )}
                <Checkbox
                  label="Has default value"
                  {...form.getInputProps(`fields.${index}.hasDefaultValue`, {
                    type: 'checkbox',
                  })}
                />
                {field.hasDefaultValue && (
                  <TextInput
                    placeholder="Optional default value"
                    {...form.getInputProps(`fields.${index}.defaultValue`)}
                  />
                )}
              </Grid.Col>
            </Grid>
          ))}
          <Group justify="flex-start">
            <Button variant="outline" size="xs" onClick={addCustomField}>
              Add field
            </Button>
          </Group>
          <Group justify="flex-end">
            <Button disabled={submitButtonDisabled} size="xs" type="submit">
              Save
            </Button>
          </Group>
        </Stack>
      </form>
    </div>
  );
};

export default CreateEmbeddingSchemaForm;
