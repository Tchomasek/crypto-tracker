import React from "react";
import { Coin, SortDirection, SortKey } from "../types";
import { getFinnhubSymbol } from "../constants";

interface CoinTableProps {
  coins: Coin[];
  subscribedSymbols: string[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onHeaderClick: (newSortKey: SortKey) => void;
  onSubscriptionToggle: (symbol: string) => void;
}

export const CoinTable: React.FC<CoinTableProps> = ({
  coins,
  subscribedSymbols,
  sortKey,
  sortDirection,
  onHeaderClick,
  onSubscriptionToggle,
}) => {
  const isSubscribed = (symbol: string) =>
    subscribedSymbols.includes(getFinnhubSymbol(symbol));

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th
              className="sortable-header"
              onClick={() => onHeaderClick("market_cap_rank")}
            >
              Rank
              <span
                className="sort-arrow"
                style={{ opacity: sortKey === "market_cap_rank" ? 1 : 0 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
            <th></th>
            <th
              className="sortable-header"
              onClick={() => onHeaderClick("symbol")}
            >
              Symbol
              <span
                className="sort-arrow"
                style={{ opacity: sortKey === "symbol" ? 1 : 0 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
            <th
              className="sortable-header"
              onClick={() => onHeaderClick("name")}
            >
              Name
              <span
                className="sort-arrow"
                style={{ opacity: sortKey === "name" ? 1 : 0 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
            <th
              className="col-value sortable-header"
              onClick={() => onHeaderClick("current_price")}
            >
              Value
              <span
                className="sort-arrow"
                style={{ opacity: sortKey === "current_price" ? 1 : 0 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
            <th
              className="sortable-header"
              onClick={() => onHeaderClick("price_change_percentage_24h")}
            >
              24h % Change
              <span
                className="sort-arrow"
                style={{
                  opacity: sortKey === "price_change_percentage_24h" ? 1 : 0,
                }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
            <th
              className="sortable-header"
              onClick={() => onHeaderClick("subscription")}
            >
              Actions
              <span
                className="sort-arrow"
                style={{ opacity: sortKey === "subscription" ? 1 : 0 }}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr
              key={coin.id}
              className={
                coin.price_change_direction === "up"
                  ? "flash-green"
                  : coin.price_change_direction === "down"
                  ? "flash-red"
                  : ""
              }
            >
              <td data-label="Rank">{coin.market_cap_rank}</td>
              <td data-label="Coin">
                <img src={coin.image} alt={coin.name} width="30" />
              </td>
              <td data-label="Symbol">{coin.symbol}</td>
              <td data-label="Name">{coin.name}</td>
              <td data-label="Value" className="col-value">
                ${coin.current_price.toLocaleString()}
              </td>
              <td
                data-label="24h % Change"
                style={{
                  color:
                    coin.price_change_percentage_24h > 0
                      ? "var(--price-up)"
                      : "var(--price-down)",
                }}
              >
                {coin.price_change_percentage_24h.toFixed(2)}%
              </td>
              <td data-label="Actions">
                <button
                  onClick={() => onSubscriptionToggle(coin.symbol)}
                  className={
                    isSubscribed(coin.symbol)
                      ? "unsubscribe-btn"
                      : "subscribe-btn"
                  }
                >
                  {isSubscribed(coin.symbol) ? "Unsubscribe" : "Subscribe"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
