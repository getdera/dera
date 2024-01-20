'use client';

import { useGetAuthToken } from '@/hooks/common';
import { Group, Paper, Text } from '@mantine/core';
import { DataTable, useDataTableColumns } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { fetchEmbeddingSchemaData } from '../../lib/dera-client/dera.client';
import {
  EmbeddingSchemaData,
  PostgresField,
} from '../../lib/dera-client/types/embeddings';
import { showErrorNotification } from '../../lib/utils';
import LoadingAnimation from '../projects/project-view/loading-animation';

export type EmbeddingSchemaDataTabProps = {
  orgId: string;
  projectId: string;
  embeddingSchemaId: string;
};

type EmbeddingSchemaDataTableProps = EmbeddingSchemaDataTabProps & {
  fields: PostgresField[];
};

// Pass in the fields from the parent component first, then load the rows inside this component.
// Needed for making resizing work with unknown columns.
const EmbeddingSchemaDataTable = (props: EmbeddingSchemaDataTableProps) => {
  const batchSize = 50;

  const { getAuthToken } = useGetAuthToken();

  const { orgId, projectId, embeddingSchemaId, fields } = props;

  const storeColumnsKey = `col-key-schema-${embeddingSchemaId}-data`;

  const { effectiveColumns } = useDataTableColumns({
    key: storeColumnsKey,
    columns: fields.map((field) => ({
      accessor: field.name,
      title: field.name,
      width: 240,
      resizable: true,
      ellipsis: true,
    })),
  });

  const [fetching, setFetching] = useState<boolean>(true);
  const [rows, setRows] = useState<EmbeddingSchemaData[]>([]);

  const fetchData = async () => {
    setFetching(true);
    const token = await getAuthToken();

    if (!token) {
      showErrorNotification(
        'Unable to get data because no auth token was retrieved.',
      );
      setFetching(false);
      return;
    }

    try {
      const dataResp = await fetchEmbeddingSchemaData(
        token,
        orgId,
        projectId,
        embeddingSchemaId,
        {
          offset: rows.length,
          limit: batchSize,
        },
      );
      setRows([...rows, ...dataResp.rows]);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchData().then();
  }, []);

  const loadMoreRows = async () => {
    await fetchData();
  };

  // FEAT: UX can be improved
  // e.g. specifying offset and batch size, or a load more button, or allowing columns to be specified (requires backend changes).
  return (
    <>
      <Paper p="md" mt="sm" mb="sm" withBorder>
        <Group justify="space-between">
          <Text size="sm">Showing {rows.length} records</Text>
        </Group>
      </Paper>
      {/* BUG: highlightOnHover and sticky header does not work. Unsure if related to order of CSS imports. */}
      <DataTable
        borderRadius="sm"
        striped
        highlightOnHover
        height={600}
        withTableBorder
        withColumnBorders
        storeColumnsKey={storeColumnsKey}
        fetching={fetching}
        records={rows}
        columns={effectiveColumns}
        onScrollToBottom={loadMoreRows}
        customLoader={<LoadingAnimation />}
      />
    </>
  );
};

const EmbeddingSchemaDataTab = (props: EmbeddingSchemaDataTabProps) => {
  const { getAuthToken } = useGetAuthToken();

  const [fields, setFields] = useState<PostgresField[]>([]);

  const fetchColumns = async () => {
    const token = await getAuthToken();

    if (!token) {
      showErrorNotification(
        'Unable to get data because no auth token was retrieved.',
      );
      return;
    }

    try {
      const dataResp = await fetchEmbeddingSchemaData(
        token,
        props.orgId,
        props.projectId,
        props.embeddingSchemaId,
        {
          offset: 0,
          limit: 0,
        },
      );
      setFields(dataResp.fields);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    fetchColumns().then();
  }, []);

  return fields.length ? (
    <EmbeddingSchemaDataTable
      orgId={props.orgId}
      projectId={props.projectId}
      embeddingSchemaId={props.embeddingSchemaId}
      fields={fields}
    />
  ) : (
    <LoadingAnimation />
  );
};

export default EmbeddingSchemaDataTab;
