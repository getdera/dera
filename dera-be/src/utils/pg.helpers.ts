import { Client, ClientConfig, QueryResult } from 'pg';

export type ParameterizedQuery = {
  text: string;
  values: any[];
};

export async function runSqlDdlsInTransaction(
  config: ClientConfig,
  sqlDdls: (string | ParameterizedQuery)[],
) {
  if (!sqlDdls.length) {
    return;
  }

  const client = new Client(config);
  try {
    await client.connect();
    await client.query('BEGIN');
    for (const sqlDdl of sqlDdls) {
      if (typeof sqlDdl === 'string') {
        await client.query(sqlDdl);
      } else {
        await client.query(sqlDdl.text, sqlDdl.values);
      }
    }
    await client.query('COMMIT');
  } finally {
    await client.end();
  }
}

export async function runSqlDdlGetResults(
  config: ClientConfig,
  sqlDdl: string | ParameterizedQuery,
): Promise<{
  res: QueryResult<any>;
  timeTakenMs: number;
}> {
  const client = new Client(config);

  try {
    await client.connect();
    const now = new Date();
    const result =
      typeof sqlDdl === 'string'
        ? await client.query(sqlDdl)
        : await client.query(sqlDdl.text, sqlDdl.values);
    return {
      res: result,
      timeTakenMs: new Date().getTime() - now.getTime(),
    };
  } finally {
    await client.end();
  }
}
