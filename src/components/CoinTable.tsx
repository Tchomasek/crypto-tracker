import React from "react";
import { Coin, SortDirection, SortKey } from "../types";
import { getFinnhubSymbol } from "../constants";
import { SortableHeader } from "./SortableHeader";

import "./CoinTable.css";
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
            <SortableHeader
              title="Rank"
              sortKey="market_cap_rank"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
            <th></th>
            <SortableHeader
              title="Symbol"
              sortKey="symbol"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
            <SortableHeader
              title="Name"
              sortKey="name"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
            <SortableHeader
              title="Value"
              sortKey="current_price"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
            <SortableHeader
              title="24h % Change"
              sortKey="price_change_percentage_24h"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
            <SortableHeader
              title="Actions"
              sortKey="subscription"
              currentSortKey={sortKey}
              sortDirection={sortDirection}
              onHeaderClick={onHeaderClick}
            />
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
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </td>
              <td data-label="Actions">
                <button
                  onClick={() => onSubscriptionToggle(coin.symbol)}
                  className={
                    isSubscribed(coin.symbol)
                      ? "unsubscribe-btn"
                      : "subscribe-btn"
                  }
                  aria-label={
                    isSubscribed(coin.symbol)
                      ? `Unsubscribe from ${coin.name} real-time price updates`
                      : `Subscribe to ${coin.name} real-time price updates`
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
