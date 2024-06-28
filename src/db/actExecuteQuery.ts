import mysql2 from "mysql2";
import { dbConfig } from "./dbConfig";

import { makePoolExecuteQuery } from "./makePoolExecuteQuery";
import { altcoinTypeCast } from "./type-cast";

export const actExecuteQuery = makePoolExecuteQuery(
  mysql2.createPool({ ...dbConfig, typeCast: altcoinTypeCast })
);
