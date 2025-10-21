export const COINGECKO_API_KEY = process.env.REACT_APP_COINGECKO_API_KEY;
export const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;

// uncomment to test locally, those variables would in real app come from .env file
// export const COINGECKO_API_KEY = "CG-umbr6x4QcVEvKGNkXbLaADcc"
// export const FINNHUB_API_KEY = "d3p7re1r01qt2em63hv0d3p7re1r01qt2em63hvg";

export const NUMBER_OF_COINS = 100;
export const MAX_SUBSCRIPTIONS = 5;

export const FINNHUB_WS_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;
export const COINGECKO_API_URL = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${NUMBER_OF_COINS}&page=1&sparkline=false&x_cg_demo_api_key=${COINGECKO_API_KEY}`;

export const getFinnhubSymbol = (symbol: string): string =>
  `BINANCE:${symbol.toUpperCase()}USDT`;
