'use client';

import { useAuth } from '@clerk/nextjs';
import { showErrorNotification } from '../../lib/utils';
import { listMatchQueriesInSchema } from '../../lib/dera-client/dera.client';
import { useEffect, useState } from 'react';
import { ActionIcon, Group, Modal, Paper, Text, Tooltip } from '@mantine/core';
import {
  DataTable,
  DataTableRowClickHandler,
  useDataTableColumns,
} from 'mantine-datatable';
import { MatchQueryResp } from '../../lib/dera-client/types/embedding-match-queries-results';
import LoadingAnimation from '../projects/project-view/loading-animation';
import { useDisclosure } from '@mantine/hooks';
import MatchQueryWithResultsDetailsComponent from './match-query-with-results-component';
import { IconEye } from '@tabler/icons-react';

export type EmbeddingsMatchingTabProps = {
  orgId: string;
  projectId: string;
  embeddingSchemaId: string;
};

const EmbeddingsMatchingTab = (props: EmbeddingsMatchingTabProps) => {
  const { getToken } = useAuth();

  const { orgId, embeddingSchemaId } = props;

  const [fetching, setFetching] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [rows, setRows] = useState<MatchQueryResp[]>([]);
  const [matchQueryInView, setMatchQueryInView] =
    useState<MatchQueryResp | null>(null);

  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  const storeColumnsKey = `col-key-schema-${embeddingSchemaId}-queries`;

  const { effectiveColumns } = useDataTableColumns<MatchQueryResp>({
    key: storeColumnsKey,
    columns: [
      {
        accessor: 'xxx_action', // dummy accessor, for virtual column
        title: '',
        resizable: false,
        ellipsis: false,
        width: 50,
        render: (record) => (
          <Tooltip label="View results">
            <ActionIcon size="xs">
              <IconEye />
            </ActionIcon>
          </Tooltip>
        ),
      },
      {
        accessor: 'id',
        resizable: true,
        ellipsis: true,
      },
      {
        accessor: 'createdAt',
        resizable: true,
        ellipsis: true,
        render: (record) => new Date(record.createdAt).toLocaleString(),
      },
      {
        accessor: 'fromApi',
        resizable: true,
        render: (record) => record.fromApi.toString(),
      },
      {
        accessor: 'matchQueryBody.content',
        title: 'Query',
        resizable: true,
        width: '60%',
        ellipsis: true,
      },
    ],
  });

  const fetchMatchQueriesInSchema = async () => {
    try {
      setFetching(true);
      const token = await getToken({
        template: process.env.NEXT_PUBLIC_JWT_TEMPLATE_NAME || undefined,
      });
      if (!token) {
        showErrorNotification(
          'The request was not sent because no auth token was retrieved.',
        );
        setFetching(false);
        return;
      }

      const listMatchQueriesResp = await listMatchQueriesInSchema(
        token,
        orgId,
        embeddingSchemaId,
        currentPage + 1,
      );
      setRows([...rows, ...listMatchQueriesResp.queries]);
      setHasNextPage(listMatchQueriesResp.hasNextPage);
      setCurrentPage(listMatchQueriesResp.page);
      setFetching(false);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
      setFetching(false);
    }
  };

  const onMatchQueryClick: DataTableRowClickHandler<MatchQueryResp> = (row) => {
    setMatchQueryInView(row.record);
    openModal();
  };

  const onModalClose = () => {
    setMatchQueryInView(null);
    closeModal();
  };

  const loadMoreRows = async () => {
    if (hasNextPage) {
      await fetchMatchQueriesInSchema();
    }
  };

  useEffect(() => {
    fetchMatchQueriesInSchema().then();
  }, []);

  return (
    <>
      {matchQueryInView ? (
        <Modal
          opened={modalOpened}
          onClose={onModalClose}
          size="100%"
          title={`Match Query ${matchQueryInView.id}`}
          centered
        >
          <MatchQueryWithResultsDetailsComponent
            matchQuery={matchQueryInView}
          />
        </Modal>
      ) : null}
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
        onRowClick={onMatchQueryClick}
        customLoader={<LoadingAnimation />}
      />
    </>
  );
};

export default EmbeddingsMatchingTab;
