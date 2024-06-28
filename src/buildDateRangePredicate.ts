import sql, { raw, Sql } from "sql-template-tag";
const sqlFragment = sql;

import { DateRange, isAfterDate, isBeforeDate, isBetweenDates } from "./dateRange";
import { formatDateTime } from "./formatDate";

export function buildDateRangePredicate(dateRange: DateRange, columnName: string = "time"): Sql | null {
  if (!dateRange) {
    return null;
  }

  const rawColumnName = raw(`\`${ columnName }\``);

  if (isBeforeDate(dateRange)) {
    return sqlFragment`${ rawColumnName } <= ${ formatDateTime(dateRange.before) }`;
  }
  
  if (isAfterDate(dateRange)) {
    return sqlFragment`${ rawColumnName } > ${ formatDateTime(dateRange.after) }`;
  }
  
  if (isBetweenDates(dateRange)) {
    const { start, end } = dateRange;
    return sqlFragment`${ rawColumnName } BETWEEN ${ formatDateTime(start) } AND ${ formatDateTime(end) }`;
  }
}