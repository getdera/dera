import LoadingAnimation from '@/components/projects/project-view/loading-animation';
import {
  useMatchResultsForQuery,
  useSearchMatchQueries,
} from '@/hooks/queries';
import { MatchQueryResp } from '@/lib/dera-client/types/embedding-match-queries-results';
import { showErrorNotification } from '@/lib/utils';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconEye,
} from '@tabler/icons-react';
import {
  DataTable,
  DataTableRowClickHandler,
  useDataTableColumns,
} from 'mantine-datatable';
import MatchResultRow from './match-result-row';

interface Props {
  orgId: string;
  projectId: string;
  matchQuery: MatchQueryResp;
}

export default function EmbeddingQueryResultsCompareModal({
  orgId,
  projectId,
  matchQuery,
}: Props) {
  const { matchQueryBody, embeddingSchema } = matchQuery;

  const { matchedQueries, isLoadingMatchedQueries } = useSearchMatchQueries({
    orgId,
    searchFilters: {
      content: matchQueryBody.content,
      projectId,
      page: 0,
    },
    onError: (error) => {
      modals.closeAll();
      showErrorNotification((error as Error).message);
    },
  });

  const storeColumnsKey = `col-key-query-compare`;
  const filteredMatchedQueries = matchedQueries.filter((entry) => {
    return entry.id !== matchQuery.id;
  });

  const { effectiveColumns } = useDataTableColumns<MatchQueryResp>({
    key: storeColumnsKey,
    columns: [
      {
        title: 'Embedding Schema',
        accessor: 'embeddingSchema.name',
        resizable: true,
        ellipsis: true,
      },
      {
        title: 'Query Id',
        accessor: 'id',
        resizable: true,
        ellipsis: true,
      },
      {
        title: 'Query Time',
        accessor: 'createdAt',
        resizable: true,
        ellipsis: true,
        render: (record) => new Date(record.createdAt).toLocaleString(),
      },
      {
        accessor: 'xxx_action', // dummy accessor, for virtual column
        title: '',
        resizable: false,
        ellipsis: false,
        width: 50,
        render: (record) => (
          <Tooltip label="View comparison">
            <ActionIcon size="sm" variant="default">
              <IconArrowNarrowRight />
            </ActionIcon>
          </Tooltip>
        ),
      },
    ],
  });

  const baseQueryDetails = [
    {
      label: 'Embedding Schema',
      value: embeddingSchema.name,
    },
    {
      label: 'Query Id',
      value: matchQuery.id,
    },
    {
      label: 'Query',
      value: matchQueryBody.content,
    },
  ];

  const handleRowClick: DataTableRowClickHandler<MatchQueryResp> = ({
    record,
  }) => {
    openCompare(record);
  };

  function openCompare(compareMatchedQuery: MatchQueryResp) {
    const modalId = 'compareQueryResults';
    modals.open({
      modalId,
      title: (
        <Group>
          <Button
            variant="default"
            onClick={() => modals.close(modalId)}
            leftSection={<IconArrowNarrowLeft />}
            size="compact-sm"
          >
            Back
          </Button>
        </Group>
      ),
      children: (
        <CompareTable
          matchQuery1={matchQuery}
          matchQuery2={compareMatchedQuery}
        />
      ),
      size: '100%',
      withCloseButton: false,
    });
  }

  return (
    <Stack>
      <Paper withBorder>
        <Stack p="md">
          <Text fw="bold" size="sm">
            Query data
          </Text>
          <Group>
            {baseQueryDetails.map(({ label, value }) => (
              <Card key={label}>
                <Stack>
                  <Text component="div" fw="bold" size="sm" c="dimmed">
                    {label}
                  </Text>
                  <Text component="div">{value}</Text>
                </Stack>
              </Card>
            ))}
          </Group>
        </Stack>
      </Paper>

      <Text fw="500" size="sm">
        Select a result to compare against
      </Text>

      <DataTable
        borderRadius="sm"
        striped
        highlightOnHover
        height={680}
        withTableBorder
        withColumnBorders
        storeColumnsKey={storeColumnsKey}
        fetching={isLoadingMatchedQueries}
        records={filteredMatchedQueries}
        columns={effectiveColumns}
        onRowClick={handleRowClick}
        customLoader={<LoadingAnimation />}
      />
    </Stack>
  );
}

function CompareTable({
  matchQuery1,
  matchQuery2,
}: {
  matchQuery1: MatchQueryResp;
  matchQuery2: MatchQueryResp;
}) {
  return (
    <SimpleGrid cols={2}>
      <CompareDataTable matchQuery={matchQuery1} />
      <CompareDataTable matchQuery={matchQuery2} />
    </SimpleGrid>
  );
}

function CompareDataTable({ matchQuery }: { matchQuery: MatchQueryResp }) {
  const { matchedQueryResults, isLoadingMatchedQueryResults } =
    useMatchResultsForQuery({
      matchQuery,
      onError: (err) => {
        showErrorNotification((err as any)?.message || 'An error occurred.');
      },
    });

  const rows = matchedQueryResults[0]?.resultBody.rows || [];

  const { effectiveColumns } = useDataTableColumns<Record<string, any>>({
    key: undefined,
    columns: [
      {
        accessor: 'xxx_action', // dummy accessor, for virtual column
        title: '',
        resizable: false,
        ellipsis: false,
        width: 50,
        render: () => <IconEye />,
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

  return (
    <Stack gap="xs">
      <div>
        <Text component="div" fw="bold" classNames={{ root: 'ellipsis' }}>
          {matchQuery.embeddingSchema.name}
        </Text>
        <Badge variant="default" maw="100%">
          {matchQuery.id}
        </Badge>
      </div>
      <DataTable
        borderRadius="sm"
        striped
        highlightOnHover
        height={680}
        withTableBorder
        withColumnBorders
        fetching={isLoadingMatchedQueryResults}
        records={rows}
        columns={effectiveColumns}
        customLoader={<LoadingAnimation />}
        rowExpansion={{
          allowMultiple: true,
          content: (row) => <MatchResultRow matchResultRow={row.record} />,
        }}
      />
    </Stack>
  );
}

EmbeddingQueryResultsCompareModal.open =
  function openEmbeddingQueryResultsCompareModal(props: Props) {
    const modalId = 'EmbeddingQueryResultsCompareModal';

    modals.open({
      modalId,
      title: 'Compare Query Results',
      children: <EmbeddingQueryResultsCompareModal {...props} />,
      onClose: () => modals.close(modalId),
      size: '100%',
    });
  };
