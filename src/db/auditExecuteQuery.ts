import { Pool } from "pg";
import { makeExecuteQuery } from "../pg/makePoolExecuteQuery";

const auditPool = new Pool({
  host: process.env.PG_HOST,
  port: 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD
});

export const auditExecuteQuery = makeExecuteQuery(auditPool);