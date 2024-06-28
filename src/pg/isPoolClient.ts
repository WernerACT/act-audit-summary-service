import { Client, PoolClient } from "pg";

export const isPoolClient = (client: Client | PoolClient): client is PoolClient => {
  return "release" in client && typeof client.release === "function";
}
