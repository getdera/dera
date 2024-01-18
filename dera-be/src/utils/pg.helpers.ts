import { Pool, PoolConfig, QueryResult } from 'pg';

export type ParameterizedQuery = {
  text: string;
  values: any[];
};

export async function runSqlDdlsInTransaction(
  config: PoolConfig,
  sqlDdls: (string | ParameterizedQuery)[],
) {
  if (!sqlDdls.length) {
    return;
  }

  const pool = new Pool(config);
  try {
    await pool.query('BEGIN');
    for (const sqlDdl of sqlDdls) {
      if (typeof sqlDdl === 'string') {
        await pool.query(sqlDdl);
      } else {
        await pool.query(sqlDdl.text, sqlDdl.values);
      }
    }
    await pool.query('COMMIT');
  } finally {
    await pool.end();
  }
}

export async function runSqlDdlGetResults(
  config: PoolConfig,
  sqlDdl: string | ParameterizedQuery,
): Promise<{
  res: QueryResult<any>;
  timeTakenMs: number;
}> {
  const pool = new Pool(config);

  try {
    const now = new Date();
    const result =
      typeof sqlDdl === 'string'
        ? await pool.query(sqlDdl)
        : await pool.query(sqlDdl.text, sqlDdl.values);
    return {
      res: result,
      timeTakenMs: new Date().getTime() - now.getTime(),
    };
  } finally {
    await pool.end();
  }
}
