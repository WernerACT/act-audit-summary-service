export const currencies: Currency[] = [
  "ADA",
  "BAT",
  "BCC",
  "BNB",
  "BSV",
  "BTC",
  "BTCP",
  "BTG",
  "BTT",
  "BTTOLD",
  "COMP",
  "DAI",
  "DASH",
  "DOGE",
  "DOT",
  "ETH",
  "ETHW",
  "FLR",
  "GAS",
  "KAS",
  "LINK",
  "LTC",
  "MATIC",
  "NEO",
  "NMC",
  "SGB",
  "SHIB",
  "SOL",
  "TRX",
  "USDC",
  "USDT",
  "WLD",
  "XAG",
  "XAU",
  "XLM",
  "XMR",
  "XRP",
  "XZAR",
  "ZAR",
  "ZEC"
];

export type CryptoCurrency =
  "ADA" |
  "BAT" |
  "BCC" |
  "BNB" |
  "BSV" |
  "BTC" |
  "BTCP" |
  "BTG" |
  "BTT" |
  "BTTOLD" |
  "COMP" |
  "DAI" |
  "DASH" |
  "DOGE" |
  "DOT" |
  "ETH" |
  "ETHW" |
  "FLR" |
  "GAS" |
  "KAS" |
  "LINK" |
  "LTC" |
  "MATIC" |
  "NEO" |
  "NMC" |
  "SGB" |
  "SHIB" |
  "SOL" |
  "TRX" |
  "USDC" |
  "USDT" |
  "WLD" |
  "XAG" |
  "XAU" |
  "XLM" |
  "XMR" |
  "XRP" |
  "ZEC";

export type ZarCurrency = "ZAR" | "XZAR";

export type Currency = CryptoCurrency | ZarCurrency;

export type BaseCurrency = "ZAR" | "USDT";

export type TradingPair = { [currency in CryptoCurrency]: BaseCurrency[] };

export type MetalCurrency = "XAG" | "XAU";

export const TRADING_PAIRS: TradingPair = {
  ADA: ["ZAR"],
  BAT: ["ZAR"],
  BCC: ["ZAR"],
  BNB: ["ZAR"],
  BSV: ["ZAR"],
  BTC: ["ZAR", "USDT"],
  BTCP: ["ZAR"],
  BTG: ["ZAR"],
  BTT: ["ZAR"],
  BTTOLD: ["ZAR"],
  COMP: ["ZAR"],
  DAI: ["ZAR"],
  DASH: ["ZAR"],
  DOGE: ["ZAR"],
  DOT: ["ZAR"],
  ETH: ["ZAR"],
  ETHW: ["ZAR"],
  FLR: ["ZAR"],
  GAS: ["ZAR"],
  KAS: ["ZAR"],
  LINK: ["ZAR"],
  LTC: ["ZAR"],
  MATIC: ["ZAR"],
  NEO: ["ZAR"],
  NMC: ["ZAR"],
  SGB: ["USDT"],
  SHIB: ["ZAR", "USDT"],
  SOL: ["ZAR"],
  TRX: ["ZAR"],
  USDC: ["ZAR"],
  USDT: ["ZAR"],
  WLD: ["ZAR"],
  XAG: ["ZAR"],
  XAU: ["ZAR"],
  XLM: ["ZAR"],
  XMR: ["ZAR"],
  XRP: ["ZAR"],
  ZEC: ["ZAR"]
}

export const isZarCurrency = (currency: Currency): currency is ZarCurrency => {
  return currency === "ZAR" || currency === "XZAR";
}

export const isMetalCurrency = (currency: Currency): currency is MetalCurrency => {
  return METAL_CURRENCIES.includes(currency as MetalCurrency);
}

export const ZAR_CURRENCIES: ZarCurrency[] = ["ZAR", "XZAR"];
export const METAL_CURRENCIES: MetalCurrency[] = ["XAG", "XAU"];
export const CRYPTO_CURRENCIES: Currency[] = currencies.filter(currency => !ZAR_CURRENCIES.includes(currency as ZarCurrency));
