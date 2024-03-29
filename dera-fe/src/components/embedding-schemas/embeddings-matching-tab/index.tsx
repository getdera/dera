'use client';

import { useGetAuthToken } from '@/hooks/common';
import { ActionIcon, Button, Group, Paper, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEye, IconRefresh, IconScale } from '@tabler/icons-react';
import {
  DataTable,
  DataTableRowClickHandler,
  useDataTableColumns,
} from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { listMatchQueriesInSchema } from '../../../lib/dera-client/dera.client';
import { MatchQueryResp } from '../../../lib/dera-client/types/embedding-match-queries-results';
import { showErrorNotification } from '../../../lib/utils';
import LoadingAnimation from '../../projects/project-view/loading-animation';
import EmbeddingQueryResultsCompareModal from './embedding-query-results-compare-modal';
import classes from './embeddings-matching-tab.module.css';
import MatchQueryWithResultsDetailsComponent from './match-query-with-results-component';

export type EmbeddingsMatchingTabProps = {
  orgId: string;
  projectId: string;
  embeddingSchemaId: string;
};

const EmbeddingsMatchingTab = (props: EmbeddingsMatchingTabProps) => {
  const { getAuthToken } = useGetAuthToken();

  const { orgId, projectId, embeddingSchemaId } = props;

  const [fetching, setFetching] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(-1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [rows, setRows] = useState<MatchQueryResp[]>([]);

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
            <ActionIcon size="sm" variant="default">
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
        accessor: 'matchQueryBody.content',
        title: 'Query',
        resizable: true,
        width: '60%',
        ellipsis: true,
        render: (record) => (
          <Group wrap="nowrap">
            <Text
              component="div"
              classNames={{ root: `${classes.queryText} ellipsis` }}
            >
              {record.matchQueryBody.content}
            </Text>
            <Tooltip label="Compare results based on the same query">
              <ActionIcon size="sm" variant="default">
                <IconScale
                  onClick={(ev) => {
                    ev.stopPropagation();
                    EmbeddingQueryResultsCompareModal.open({
                      orgId,
                      projectId,
                      matchQuery: record,
                    });
                  }}
                />
              </ActionIcon>
            </Tooltip>
          </Group>
        ),
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
    ],
  });

  const fetchMatchQueriesInSchema = async (refresh?: boolean) => {
    try {
      setFetching(true);
      const token = await getAuthToken();

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
        refresh ? 0 : currentPage + 1,
      );
      setRows(
        refresh
          ? listMatchQueriesResp.queries
          : [...rows, ...listMatchQueriesResp.queries],
      );
      setHasNextPage(listMatchQueriesResp.hasNextPage);
      setCurrentPage(listMatchQueriesResp.page);
      setFetching(false);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
      setFetching(false);
    }
  };

  const onMatchQueryClick: DataTableRowClickHandler<MatchQueryResp> = (row) => {
    const matchQueryInView = row.record;

    modals.open({
      size: '100%',
      title: `Match Query ${matchQueryInView.id}`,
      children: (
        <MatchQueryWithResultsDetailsComponent matchQuery={matchQueryInView} />
      ),
    });
  };

  const loadMoreRows = async () => {
    if (hasNextPage) {
      await fetchMatchQueriesInSchema();
    }
  };

  const refreshTable = async () => {
    await fetchMatchQueriesInSchema(true);
  };

  useEffect(() => {
    fetchMatchQueriesInSchema().then();
  }, []);

  return (
    <>
      <Paper p="md" mt="sm" mb="sm" withBorder>
        <Group justify="flex-start">
          <Text size="sm">Showing {rows.length} records</Text>
          <Button size="xs" onClick={refreshTable}>
            <IconRefresh />
          </Button>
        </Group>
      </Paper>
      {/* BUG: highlightOnHover and sticky header does not work. Unsure if related to order of CSS imports. */}
      <DataTable
        borderRadius="md"
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
