import { BaseCurrency, CryptoCurrency } from "./currencies";

export type TradingPairType = `${ Uppercase<BaseCurrency> }_${ Uppercase<CryptoCurrency> }`;

export function buildTradingPair(baseCurrency: BaseCurrency, currency: CryptoCurrency) {
  return `${ baseCurrency.toUpperCase() }_${ currency.toUpperCase() }` as TradingPairType;
}