'use client';

import { useAuth } from '@clerk/nextjs';
import { Container, Grid, Tabs, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { showErrorNotification } from '../../lib/utils';
import { getEmbeddingSchema } from '../../lib/dera-client/dera.client';
import { EmbeddingSchemaResponse } from '../../lib/dera-client/types/embedding-schema';
import EmbeddingSchemaDataTab from './embedding-schema-data-tab';
import EmbeddingSchemaUploadTab from './embedding-schema-upload-tab';
import EmbeddingsMatchingTab from './embeddings-matching-tab';
import EmbeddingsMatchingApiRefTab from './embeddings-matching-api-ref-tab';

const EmbeddingSchemaComponent = () => {
  const params = useParams<{
    orgId: string;
    projectId: string;
    embeddingSchemaId: string;
  }>();
  const [embeddingSchema, setEmbeddingSchema] =
    useState<EmbeddingSchemaResponse | null>(null);
  const { getToken } = useAuth();

  const getEmbbedingSchema = async () => {
    const token = await getToken({
      template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
    });

    if (!token) {
      showErrorNotification(
        'Unable to get embedding schema details because no auth token was retrieved.',
      );
      return;
    }

    try {
      const embeddingSchemaResp = await getEmbeddingSchema(
        token,
        params.orgId,
        params.projectId,
        params.embeddingSchemaId,
      );
      setEmbeddingSchema(embeddingSchemaResp);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    getEmbbedingSchema().then();
  }, []);

  return embeddingSchema ? (
    <Container fluid>
      <Grid>
        <Grid.Col span={12}>
          <Text size="xl" fw={500}>
            {embeddingSchema.name}
          </Text>
          <Text size="sm" c="dimmed">
            {embeddingSchema.description}
          </Text>
        </Grid.Col>
      </Grid>
      <Tabs defaultValue="data">
        <Tabs.List>
          <Tabs.Tab value="data">Data</Tabs.Tab>
          <Tabs.Tab value="upload">Upload</Tabs.Tab>
          <Tabs.Tab value="embeddings-matching">Embeddings matching</Tabs.Tab>
          <Tabs.Tab value="embeddings-matching-api-ref">
            Matching API docs
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="data">
          <EmbeddingSchemaDataTab
            orgId={params.orgId}
            projectId={params.projectId}
            embeddingSchemaId={embeddingSchema.id}
          />
        </Tabs.Panel>

        <Tabs.Panel value="upload">
          <EmbeddingSchemaUploadTab embeddingSchemaId={embeddingSchema.id} />
        </Tabs.Panel>
        <Tabs.Panel value="embeddings-matching">
          <EmbeddingsMatchingTab
            orgId={params.orgId}
            projectId={params.projectId}
            embeddingSchemaId={embeddingSchema.id}
          />
        </Tabs.Panel>
        <Tabs.Panel value="embeddings-matching-api-ref">
          <EmbeddingsMatchingApiRefTab embeddingSchemaId={embeddingSchema.id} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  ) : null;
};

export default EmbeddingSchemaComponent;
