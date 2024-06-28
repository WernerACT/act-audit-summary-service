import { Client, Pool, PoolClient, QueryConfig, QueryResult, QueryResultRow } from "pg";

import { isPoolClient } from "./isPoolClient";

export interface ExecuteQueryFn {
  <T>(text: string, values?: any): Promise<QueryResult<T>>;

  <T>(query: QueryConfig): Promise<QueryResult<T>>;
}

type ClientFactoryFn = () => Client | PoolClient | Promise<Client | PoolClient>;

export function makeExecuteQuery(
  pool: Pool,
  releasePoolClient: boolean = true
): ExecuteQueryFn {
  return async <T extends QueryResultRow>(textOrQuery: string | QueryConfig, ...values: any[]) => {
    let result: QueryResult<T>;

    // if (typeof client === "function") {
    //   client = await client();
    // }

    const client = await pool.connect()

    try {
      if (typeof textOrQuery === "string") {
        const text = textOrQuery;
        result = await client.query({ text, values });
      } else {
        const query = textOrQuery;
        result = await client.query(query);
      }
    } finally {
      if (releasePoolClient) {
        client.release();
      }
    }

    return result;
  };
}
