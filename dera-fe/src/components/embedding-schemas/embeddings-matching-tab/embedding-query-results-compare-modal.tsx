import { MatchQueryResp } from '@/lib/dera-client/types/embedding-match-queries-results';
import { Card, Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

interface Props {
  projectId: string;
  matchQuery: MatchQueryResp;
}

export default function EmbeddingQueryResultsCompareModal({
  projectId,
  matchQuery,
}: Props) {
  const { matchQueryBody, embeddingSchemaId } = matchQuery;

  return (
    <Stack>
      <Card withBorder>
        <Stack>
          <Text>Embedding Schema: {embeddingSchemaId}</Text>
          <Text>Query: {matchQueryBody.content}</Text>
        </Stack>
      </Card>
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
