import { BaseCurrency, CryptoCurrency } from "./currencies";

export function buildBuyTradesTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let buyTradesTable = `${ currency.toLowerCase() }_buy_trades`;

  if (baseCurrency !== "ZAR") {
    buyTradesTable = `${ baseCurrency.toLowerCase() }_${ buyTradesTable }`;
  }

  return buyTradesTable;
}

export function buildSellTradesTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let buyTradesTable = `${ currency.toLowerCase() }_sell_trades`;

  if (baseCurrency !== "ZAR") {
    buyTradesTable = `${ baseCurrency.toLowerCase() }_${ buyTradesTable }`;
  }

  return buyTradesTable;
}

export function buildBuyOrdersTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let buyTradesTable = `${ currency.toLowerCase() }_buy_orders`;

  if (baseCurrency !== "ZAR") {
    buyTradesTable = `${ baseCurrency.toLowerCase() }_${ buyTradesTable }`;
  }

  return buyTradesTable;
}

export function buildSellOrdersTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let buyTradesTable = `${ currency.toLowerCase() }_sell_orders`;

  if (baseCurrency !== "ZAR") {
    buyTradesTable = `${ baseCurrency.toLowerCase() }_${ buyTradesTable }`;
  }

  return buyTradesTable;
}

export function buildTradeHistoryTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let tradeHistoryTable = `${ currency.toLowerCase() }_trade_history`;

  if (baseCurrency !== "ZAR") {
    tradeHistoryTable = `${ baseCurrency.toLowerCase() }_${ tradeHistoryTable }`;
  }

  return tradeHistoryTable;
}

export function buildChartTimestampTable(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  let chartTimestampTable = `${ currency.toLowerCase() }_chart_timestamp`;

  if (baseCurrency !== "ZAR") {
    chartTimestampTable = `${ baseCurrency.toLowerCase() }_${ chartTimestampTable }`;
  }

  return chartTimestampTable;
}