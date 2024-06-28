import dayjs from "dayjs";
import Decimal from "decimal.js";
import sql, { raw } from "sql-template-tag";
const sqlFragment = sql;

import logger from "@act/logger";

import { BaseCurrency, CryptoCurrency, TRADING_PAIRS, currencies, isZarCurrency } from "./currencies";
import { formatDateTime } from "./formatDate";
import { auditExecuteQuery } from "./db/auditExecuteQuery";
import { buildChartTimestampTable, buildTradeHistoryTable } from "./buildTables";
import { actExecuteQuery } from "./db/actExecuteQuery";

export async function populatePrices(year: number) {
  const start = dayjs(`${ year }-01-01 00:00:00`);

  logger.debug("Populating prices for year: ", year);

  for (const currency of currencies) {
    logger.debug("Reading prices for: ", currency);

    let endOfMonth = start;

    for (let i = 0; i < 12; i++) {
      endOfMonth = endOfMonth.add(1, "month");

      const insertPricesMonthly = async (price: number, timestamp?: Date) => {
        const lastDay = endOfMonth.subtract(1, "day");
        const year = lastDay.year();
        const month = lastDay.month() + 1;

        const insertQuery = sqlFragment`
          INSERT INTO prices_monthly (currency, "year", "month", price, "timestamp")
          VALUES(${ currency }, ${ year }, ${ month }, ${ price }, ${ formatDateTime(timestamp) })`;

        await auditExecuteQuery(insertQuery);
      }

      if (isZarCurrency(currency)) {
        await insertPricesMonthly(1);
        continue;
      }

      const readMonthlyPrice = async (baseCurrency: BaseCurrency, currency: CryptoCurrency) => {
        // const tradeHistoryTable = buildTradeHistoryTable(baseCurrency, currency);
        const chartTimestampTable = buildChartTimestampTable(baseCurrency, currency);

        const query = sqlFragment`
          select
            \`time\`,
            price_per_coin
          from ${ raw(chartTimestampTable) }
          where timestamp_1d = ${ endOfMonth.subtract(1, "day").add(2, "hours").unix() }
          order by id desc
          limit 1`;
    
        const rows = await actExecuteQuery(query) as { time: Date, price_per_coin: number }[];

        if (rows.length === 0) {
          return null;
        }

        const {
          time: timestamp,
          price_per_coin: price
        } = rows[0];

        return { timestamp, price };
      }

      const baseCurrencies = TRADING_PAIRS[currency];
      
      const monthlyPrice = await readMonthlyPrice(baseCurrencies[0], currency);

      if (!monthlyPrice) {
        continue;
      }

      let { price, timestamp } = monthlyPrice;

      if (!baseCurrencies.includes("ZAR")) {
        const { price: basePrice } = await readMonthlyPrice("ZAR", baseCurrencies[0] as CryptoCurrency);

        price = new Decimal(price).mul(basePrice).toNumber();
      }

      await insertPricesMonthly(price, timestamp);
    }
  }
}