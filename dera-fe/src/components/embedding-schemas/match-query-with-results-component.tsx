'use client';

import { useGetAuthToken } from '@/hooks/common';
import { ActionIcon, Grid, Group, Text, Title, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconChevronRight, IconEye } from '@tabler/icons-react';
import {
  DataTable,
  DataTableRowClickHandler,
  useDataTableColumns,
} from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { listMatchResultsForQuery } from '../../lib/dera-client/dera.client';
import {
  MatchQueryResp,
  MatchQueryResultResp,
} from '../../lib/dera-client/types/embedding-match-queries-results';
import { showErrorNotification } from '../../lib/utils';
import JsonEditor from '../json-editor/json-editor';
import LoadingAnimation from '../projects/project-view/loading-animation';

export type MatchQueryWithResultsDetailsComponentProps = {
  matchQuery: MatchQueryResp;
};

const MatchedRowsDataTable = ({
  matchResult,
}: {
  matchResult: MatchQueryResultResp;
}) => {
  const storeColumnsKey = `col-key-result-${matchResult.id}-rows`;
  const { effectiveColumns } = useDataTableColumns<{ [field: string]: any }>({
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
        title: 'id',
        resizable: true,
        ellipsis: true,
      },
      {
        accessor: 'matched_score',
        title: 'matched_score',
        resizable: true,
      },
      {
        accessor: 'embedding_text',
        title: 'embedding_text',
        resizable: true,
        ellipsis: true,
      },
    ],
  });

  const onMatchResultRowClick: DataTableRowClickHandler<{
    [field: string]: any;
  }> = (row) => {
    modals.open({
      size: '75%',
      children: <JsonEditor readOnly={true} content={{ json: row.record }} />,
    });
  };

  return (
    <DataTable
      borderRadius="sm"
      striped
      highlightOnHover
      withTableBorder
      withColumnBorders
      storeColumnsKey={storeColumnsKey}
      columns={effectiveColumns}
      records={matchResult.resultBody.rows}
      onRowClick={onMatchResultRowClick}
    />
  );
};

const MatchQueryWithResultsDetailsComponent = (
  props: MatchQueryWithResultsDetailsComponentProps,
) => {
  const { matchQuery } = props;

  const { getAuthToken } = useGetAuthToken();

  const [fetching, setFetching] = useState<boolean>(true);
  const [matchResults, setMatchResults] = useState<MatchQueryResultResp[]>([]);

  const storeColumnsKey = `col-key-query-${matchQuery.id}-results`;

  const { effectiveColumns } = useDataTableColumns<MatchQueryResultResp>({
    key: storeColumnsKey,
    columns: [
      {
        accessor: 'id',
        title: 'Result set ID',
        resizable: true,
        ellipsis: true,
        render: (record) => (
          <Group>
            <IconChevronRight />
            <Text>{record.id}</Text>
          </Group>
        ),
      },
      {
        accessor: 'createdAt',
        resizable: true,
        ellipsis: true,
        render: (record) => new Date(record.createdAt).toLocaleString(),
      },
    ],
  });

  const fetchMatchResultsForQuery = async () => {
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

      const matchResults = await listMatchResultsForQuery(
        token,
        matchQuery.orgId,
        matchQuery.id,
      );
      setMatchResults(matchResults.results);
      setFetching(false);
    } catch (err) {
      showErrorNotification((err as any)?.message || 'An error occurred.');
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMatchResultsForQuery().then();
  }, []);

  return (
    <Grid style={{ minHeight: '680px' }}>
      <Grid.Col span={12}>
        <Title order={3}>Match query content</Title>
        <Text size="sm">{matchQuery.matchQueryBody.content}</Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Title order={4}>Match query body</Title>
        <JsonEditor
          readOnly={true}
          content={{ json: matchQuery.matchQueryBody }}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Title order={4}>Match results</Title>
        {/* BUG: highlightOnHover and sticky header does not work. Unsure if related to order of CSS imports. */}
        <DataTable
          borderRadius="sm"
          striped
          highlightOnHover
          height={680}
          withTableBorder
          withColumnBorders
          storeColumnsKey={storeColumnsKey}
          fetching={fetching}
          records={matchResults}
          columns={effectiveColumns}
          customLoader={<LoadingAnimation />}
          rowExpansion={{
            allowMultiple: true,
            content: (parentRow) => (
              <MatchedRowsDataTable matchResult={parentRow.record} />
            ),
          }}
        />
      </Grid.Col>
    </Grid>
  );
};

export default MatchQueryWithResultsDetailsComponent;
