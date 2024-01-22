'use client';

import { CodeHighlight } from '@mantine/code-highlight';
import { Anchor, Grid, Text } from '@mantine/core';

export type EmbeddingsMatchingApiRefTabProps = {
  embeddingSchemaId: string;
};

const EmbeddingsMatchingApiRefTab = (
  embeddingsMatchingApiRefTabProps: EmbeddingsMatchingApiRefTabProps,
) => {
  const { embeddingSchemaId } = embeddingsMatchingApiRefTabProps;

  const code = () => `curl -X POST \\
  ${process.env.NEXT_PUBLIC_DERA_USER_API_URL}/api/v1/sdk/embedding-schemas/${embeddingSchemaId}/match \\
  --header 'Content-type: application/json' \\
  --header 'x-dera-token-key: <REPLACE_WITH_YOUR_TOKEN_KEY>' \\
  --header 'x-dera-token-secret: <REPLACE_WITH_YOUR_TOKEN_SECRET>' \\
  --data '<REQUEST_BODY>'
  `;

  const codeHighlightComponent = () => (
    // BUG: copy button is misaligned
    <CodeHighlight code={code()} language="bash" />
  );

  const requestBodyJson = `{
  /**
   * The content that you're trying to match.
   */
  content: string;

  /**
   * Embeddings of the content to match.
   */
  embeddings: number[];

  /**
   * (Optional) Additional columns to retrieve in the response. The default generated columns
   * and the matched score will always be returned.
   */
  select?: {
    additionalColumns: string[];
  };

  /**
   * (Optional) The matching operator to use. The default is COSINE_DISTANCE.
   */
  matchOperator?: 'L2' | 'INNER_PRODUCT' | 'COSINE_DISTANCE';

  /**
   * Number of rows to return. Min is 1 and max is 20.
   */
  limit: number;

  /**
   * (Optional) The column to sort by and the order. The default is to sort by the matched score
   * in descending order.
   */
  order?: {
    column?: string;
    order?: 'ASC' | 'DESC';
  };

  /**
   * (Optional) Filter by the matched score. This will add an additional WHERE clause to the query. The default is to return all matches.
   */
  matchScoreFilter?: {
    filter: '>' | '<' | '=' | '>=' | '<=';
    score: number;
  };

  /**
   * (Optional) Filter by metadata. This will add additional WHERE clauses to the query.
   * The array of metadata filters will be joined by OR. Within each metadata filter, the array
   * of filters will be joined by AND.
   */
  metadataFilters?: {
    filters: {
      column: string;
      operator: string;
      value: number | string;
    }[];
  }[]
}`;
  const responseBodyJson = `{
  /**
   * The effective match query after all the defaults are applied for optional values.
   */
  effectiveRequest: {
    content: string;
    embeddings: number[];
    limit: number;
    select: {
      additionalColumns: string[];
    };
    matchOperator: 'L2' | 'INNER_PRODUCT' | 'COSINE_DISTANCE';
    order: {
      column: string;
      order: 'ASC' | 'DESC';
    };
    matchScoreFilter: {
      filter: '>' | '<' | '=' | '>=' | '<=';
      score: number;
    } | null;
  };

  /**
   * The results of the match query.
   */
  results: {
    fields: {
      name: string;
    }[];

    /**
     * The matched rows.
     */
    rows: { [field: string]: any }[];

    /**
     * Number of rows returned. This will be equal to rows.length.
     */
    numRows: number;
  };

  matchTimeTakenMs: number;
}`;

  return (
    <Grid>
      <Grid.Col span={12} mt={4}>
        <Text size="sm">
          We are working on the web UI. For now, you can use our REST APIs to
          match your embeddings.
        </Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text size="sm">
          The APIs require API tokens. You can generate API tokens at{' '}
          <Anchor href={'/developer/settings'}>developer settings</Anchor>.
        </Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text fw={700}>Matching embeddings</Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        {codeHighlightComponent()}
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text fw={700}>Request body</Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <CodeHighlight language="json" code={requestBodyJson} />
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <Text fw={700}>Response body</Text>
      </Grid.Col>
      <Grid.Col span={12} mt={4}>
        <CodeHighlight language="json" code={responseBodyJson} />
      </Grid.Col>

      {/* <Grid.Col span={12} mt={24}>
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
      </Grid.Col> */}
    </Grid>
  );
};

export default EmbeddingsMatchingApiRefTab;
