import mysql2 from "mysql2";

import { dbConfig } from "./dbConfig";
import { altcoinTypeCast } from "./type-cast";

export function createConnection() {
  return mysql2.createConnection({
    ...dbConfig,
    typeCast: altcoinTypeCast
  });
}