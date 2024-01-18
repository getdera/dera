'use client';

import { CodeHighlight } from '@mantine/code-highlight';
import { Anchor, Code, Grid, List, Text, ThemeIcon, rem } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';

export type EmbeddingSchemaUploadTabProps = {
  embeddingSchemaId: string;
};

const EmbeddingSchemaUploadTab = (
  embeddingSchemaUploadTabProps: EmbeddingSchemaUploadTabProps,
) => {
  const { embeddingSchemaId } = embeddingSchemaUploadTabProps;

  // FEAT: If we can show the structure of the request body based on the embedding schema, that would be great.
  const code = (batch: boolean) => `curl -X POST \\
  ${
    process.env.NEXT_PUBLIC_DERA_USER_API_URL
  }/api/v1/sdk/embedding-schemas/${embeddingSchemaId}/embeddings${
    batch ? '/batch' : ''
  } \\
  --header 'Content-type: application/json' \\
  --header 'x-dera-token-key: <REPLACE_WITH_YOUR_TOKEN_KEY>' \\
  --header 'x-dera-token-secret: <REPLACE_WITH_YOUR_TOKEN_SECRET>' \\
  --data '${
    batch
      ? `{"embeddings": <REPLACE_WITH_AN_ARRAY_OF_YOUR_JSON_DATA> }`
      : `<REPLACE_WITH_YOUR_JSON_DATA>`
  }'
  `;

  const codeHighlightComponent = (batch: boolean) => (
    // BUG: copy button is misaligned
    <CodeHighlight code={code(batch)} language="bash" />
  );

  return (
    <Grid>
      <Grid.Col span={12} mt={4}>
        <Text size="sm">
          We are working on web UI upload. For now, you can use our REST APIs to
          upload your data.
        </Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text size="sm">
          The APIs require API tokens. You can generate API tokens at{' '}
          <Anchor href={'/developer/settings'}>developer settings</Anchor>.
        </Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text fw={700}>Upload one row</Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        {codeHighlightComponent(false)}
      </Grid.Col>
      <Grid.Col span={12} mt={8}>
        <Text fw={700}>Batch upload</Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        {codeHighlightComponent(true)}
      </Grid.Col>
      <Grid.Col span={12} mt={24}>
        <Text fw={700}>Notes</Text>
        <List
          size="sm"
          icon={
            <ThemeIcon size={16} radius="xl">
              <IconCircleCheck style={{ width: rem(12), height: rem(12) }} />
            </ThemeIcon>
          }
        >
          <List.Item>The request body is based on your schema.</List.Item>
          <List.Item>
            Each key in the request body corresponds to the field name.
          </List.Item>
          <List.Item>
            Nullable fields can be left out of the request and default values,
            if any, will be used.
          </List.Item>
          <List.Item>
            Vector values should be enclosed in double quotes, i.e. as string,
            e.g. <Code>"[1, 2, 3]"</Code>
          </List.Item>
        </List>
      </Grid.Col>
    </Grid>
  );
};

export default EmbeddingSchemaUploadTab;
