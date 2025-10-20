export interface Coin {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
  price_change_direction?: "up" | "down" | "none";
}

export type SortKey =
  | "market_cap_rank"
  | "name"
  | "symbol"
  | "current_price"
  | "price_change_percentage_24h"
  | "subscription";

export type SortDirection = "asc" | "desc";
