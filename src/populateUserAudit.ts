import "./loadConfig";

import { Connection } from "mysql2";

import sql, { Sql, empty, join, raw } from "sql-template-tag";
const sqlFragment = sql;

import { lastValueFrom } from "rxjs";
import { bufferCount, switchMap } from "rxjs/operators";
import { streamToRx } from "rxjs-stream";

import logger from "@act/logger";

import {
  currencies as ALL_CURRENCIES,
  BaseCurrency,
  CryptoCurrency,
  Currency,
  TRADING_PAIRS,
  isZarCurrency
} from "./currencies";

import { createConnection } from "./db/createConnection";
import { auditExecuteQuery } from "./db/auditExecuteQuery";

import { buildTradeHistoryTable } from "./buildTables";
import { buildTradingPair } from "./buildTradingPair";
import { buildDateRangePredicate } from "./buildDateRangePredicate";
import { DateRange } from "./dateRange";
import { formatDateTime } from "./formatDate";
import { populatePrices } from "./populatePrices";

interface TransactionPredicate {
  dateRange?: DateRange;
  userIds?: number | number[];
}

interface TransactionPredicateOptions {
  prefix?: string;
  userIdColumn?: string;
  timeColumn?: string;
}

function buildUserIdsPredicate(userIds?: number | number[], columnName: string = "user_id") {
  if (!userIds) {
    return null;
  }

  const rawColumnName = raw(`\`${ columnName }\``);

  if (Array.isArray(userIds)) {
    return sqlFragment`${ rawColumnName } IN (${ join(userIds, ", ") })`;
  }

  return sqlFragment`${ rawColumnName } = ${ userIds }`;
}

function combinePredicates(...predicates: Sql[]) {
  predicates = predicates.filter(predicate => !!predicate);

  if (predicates.length === 0) {
    return empty;
  }

  return join(predicates, " AND ");
}

const DEFAULT_TRANSACTION_PREDICATE_OPTIONS: TransactionPredicateOptions = {
  prefix: " AND ",
  userIdColumn: "user_id",
  timeColumn: "time"
}

function buildTransactionPredicates(
  predicate: TransactionPredicate,
  options?: TransactionPredicateOptions
) {
  if (!predicate || (!predicate.dateRange && !predicate.userIds)) {
    return empty;
  }

  options = {
    ...DEFAULT_TRANSACTION_PREDICATE_OPTIONS,
    ...(options ?? {})
  };

  const {
    prefix,
    timeColumn,
    userIdColumn
  } = options;

  const datePredicate = buildDateRangePredicate(predicate.dateRange, timeColumn);
  const userIdsPredicate = buildUserIdsPredicate(predicate.userIds, userIdColumn);

  return sqlFragment`${ raw(prefix) }${ combinePredicates(datePredicate, userIdsPredicate) }`;
}

async function populateTradingTransactions(
  connection: Connection,
  currency: Currency,
  predicate: TransactionPredicate
) {
  for (const baseCurrency of TRADING_PAIRS[currency] ?? []) {
    const tradingPair = buildTradingPair(baseCurrency, currency as CryptoCurrency);
    const tradeHistoryTable = buildTradeHistoryTable(baseCurrency, currency as CryptoCurrency);

    const sellPredicate = buildTransactionPredicates(predicate, { userIdColumn: "sellers_id" });

    const sellOrderQuery = sqlFragment`
      SELECT
        sellers_id AS user_id,
        \`time\`,
        amount_of_coins * -1 AS amount,
        'SELL' AS \`type\`,
        '${ raw(tradingPair) }' AS \`trading_pair\`
      FROM ${ raw(tradeHistoryTable) }
      WHERE active IN (1, 3)
      ${ sellPredicate }`;

    logger.debug(`Inserting SELL transactions for ${ tradingPair }...`, currency);
    await insertUserTransactions(connection, sellOrderQuery, currency);

    const buyPredicate = buildTransactionPredicates(predicate, { userIdColumn: "buyers_id" });

    const buyOrderQuery = sqlFragment`
      SELECT
        buyers_id as user_id,
        \`time\`,
        amount_of_coins_less_comm AS amount,
        'BUY' AS \`type\`,
        '${ raw(tradingPair) }' AS \`trading_pair\`
      FROM ${ raw(tradeHistoryTable) }
      WHERE active IN (1, 3)
      ${ buyPredicate }`;

    logger.debug(`Inserting BUY transactions for ${ tradingPair }...`, currency);
    await insertUserTransactions(connection, buyOrderQuery, currency);
  }

  const baseCurrencyTradingPairs = Object.keys(TRADING_PAIRS)
    .filter((c: CryptoCurrency) => TRADING_PAIRS[c].includes(currency as BaseCurrency)) as CryptoCurrency[];

  for (const cryptoCurrency of baseCurrencyTradingPairs) {
    const tradingPair = buildTradingPair(currency as BaseCurrency, cryptoCurrency);
    const tradeHistoryTable = buildTradeHistoryTable(currency as BaseCurrency, cryptoCurrency);

    const sellPredicate = buildTransactionPredicates(predicate, { userIdColumn: "sellers_id" });

    const sellOrderQuery = sqlFragment`
      SELECT
        sellers_id AS user_id,
        \`time\`,
        total_price_less_comm AS amount,
        'SELL' AS \`type\`,
        '${ raw(tradingPair) }' AS \`trading_pair\`
      FROM ${ raw(tradeHistoryTable) }
      WHERE active IN (1, 3)
      ${ sellPredicate }`;

    logger.debug(`Inserting SELL transactions for ${ tradingPair }...`, currency);
    await insertUserTransactions(connection, sellOrderQuery, currency);

    const buyPredicate = buildTransactionPredicates(predicate, { userIdColumn: "buyers_id" });

    const buyOrderQuery = sqlFragment`
      SELECT
        buyers_id AS user_id,
        \`time\`,
        total_price * -1 AS amount,
        'BUY' AS \`type\`,
        '${ raw(tradingPair) }' AS \`trading_pair\`
      FROM ${ raw(tradeHistoryTable) }
      WHERE active in (1, 3)
      ${ buyPredicate }`;

    logger.debug(`Inserting BUY transactions for ${ tradingPair }...`, currency);
    await insertUserTransactions(connection, buyOrderQuery, currency);
  }
  
}

interface UserTransactionRow {
  user_id: number;
	time: Date;
	type: string;
	amount: number;
  trading_pair?: string;
}

async function insertUserTransactions(
  connection: Connection,
  query: Sql,
  currency: Currency
) {
  let insertedRowCount = 0;

  const queryStream = connection.query(query).stream({ objectMode: true });

  const userTransactions$ = streamToRx<UserTransactionRow>(queryStream)
    .pipe(
      bufferCount(1000),
      switchMap(async rows => {
        const values = rows.map(row => {
          const {
            user_id,
            type,
            amount,
            time,
            trading_pair
          } = row;

          return sqlFragment`(
            ${ user_id }, ${ currency }, ${ type },
            ${ amount }, ${ formatDateTime(time) }, ${ trading_pair }
          )`;
        });

        const query = sqlFragment`
          INSERT INTO user_transactions (user_id, currency, "type", amount, "timestamp", trading_pair)
          VALUES ${ join(values, ", ") }`;

        await auditExecuteQuery(query);
        // await executeQuery(connection, query);

        insertedRowCount += rows.length;
        logger.info("Inserted rows...", insertedRowCount);
      })
    );

  try {
    await lastValueFrom(userTransactions$);
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    } else {
      logger.error(error);
    }
  }
}

function buildCurrencyPredicate(currency: Currency) {
  if (currency === "DASH") {
    currency = "DSH" as Currency;
  }

  return isZarCurrency(currency)
    ? sqlFragment`\`type\` IN ("ZAR", "XZAR")`
    : sqlFragment`\`type\` = ${ currency }`;
}

async function populateWithdrawals(
  connection: Connection,
  currency: Currency,
  predicate: TransactionPredicate
) {
  const currencyPredicate = buildCurrencyPredicate(currency);
  const withdrawalPredicate = buildTransactionPredicates(predicate, { timeColumn: "time_requested" });

  const withdrawalsQuery = sqlFragment`
    SELECT
      user_id,
      time_requested AS \`time\`,
      total_amount * -1 AS amount,
      'WITHDRAWAL' AS \`type\`,
      NULL AS trading_pair
    FROM withdrawals
    WHERE active = 1
    AND ${ currencyPredicate }
    ${ withdrawalPredicate }`;
  
  logger.debug(`Inserting WITHDRAWAL transactions for...`, currency);
  await insertUserTransactions(connection, withdrawalsQuery, currency);
}

async function populateDeposits(
  connection: Connection,
  currency: Currency,
  predicate: TransactionPredicate
) {
  const currencyPredicate = buildCurrencyPredicate(currency);
  const depositPredicate = buildTransactionPredicates(predicate);

  const depositQuery = sqlFragment`
    SELECT
      user_id,
      \`time\`,
      amount,
      'DEPOSIT' AS \`type\`,
      NULL AS trading_pair
    FROM account_activities
    WHERE active = 1
    AND COALESCE(comment, '') <> 'AUDIT_CORRECTION'
    AND refund = 0
    AND ${ currencyPredicate }
    ${ depositPredicate }`;

  logger.debug(`Inserting DEPOSIT transactions for...`, currency);
  await insertUserTransactions(connection, depositQuery, currency);
}

async function run() {
  const connection = createConnection();

  for (let year = 2017; year <= 2024; year++) {
    await populatePrices(year);
  }

  const predicate: TransactionPredicate = {
    userIds: 1654595
  };
  
  for (const currency of ALL_CURRENCIES) {
    if (currency === "XZAR") {
      continue;
    }

    await populateDeposits(connection, currency, predicate);
    await populateWithdrawals(connection, currency, predicate);
    await populateTradingTransactions(connection, currency, predicate);
  }
  
  logger.info("Done!");
}

run();
