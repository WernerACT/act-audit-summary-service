import * as mysql2 from "mysql2";

export interface ExecuteQueryFn<TQueryOptions = mysql2.QueryOptions> {
  <T>(sql: string, values?: any): Promise<T | T[]>;

  <T>(query: TQueryOptions): Promise<T | T[]>;
}

export function makePoolExecuteQuery(pool: mysql2.Pool): ExecuteQueryFn<mysql2.QueryOptions>;

export function makePoolExecuteQuery(pool: mysql2.Pool) {
  return <T>(sqlOrQuery: string | mysql2.QueryOptions, values?: any) => {
    return new Promise<T | T[]>(async (resolve, reject) => {
      pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        let query: mysql2.QueryOptions;

        if (typeof sqlOrQuery === "string") {
          query = { sql: sqlOrQuery, values };
        } else {
          query = sqlOrQuery;
        }
  
        connection.query(query, (error, results) => {
          connection.release();
  
          if (error) {
            return reject(error);
          }
  
          resolve(results as T | T[]);
        });
      });
    });
  }
}
