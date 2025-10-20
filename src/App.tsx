import { useEffect, useState, useRef, useMemo } from "react";
import useWebSocket from "react-use-websocket";
import "./App.css";

const COINGECKO_API_KEY = process.env.REACT_APP_COINGECKO_API_KEY;
const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;

const NUMBER_OF_COINS = 100;
const MAX_SUBSCRIPTIONS = 5;

interface Coin {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
  price_change_percentage_24h: number;
  price_change_direction?: "up" | "down" | "none";
}

type SortKey =
  | "market_cap_rank"
  | "name"
  | "symbol"
  | "current_price"
  | "price_change_percentage_24h"
  | "subscription";
type SortDirection = "asc" | "desc";

function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("market_cap_rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const subscribedSymbolsRef = useRef<string[]>([]);

  useEffect(() => {
    subscribedSymbolsRef.current = subscribedSymbols;
  }, [subscribedSymbols]);

  const { sendMessage } = useWebSocket(
    `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`,
    {
      onOpen: () => {
        console.log("connected");
        setShowConnectionError(false);
        subscribedSymbols.forEach((symbol) => {
          sendMessage(JSON.stringify({ type: "subscribe", symbol }));
        });
      },
      onClose: () => {
        console.log("disconnected");
        setShowConnectionError(true);
      },
      onError: (event) => {
        console.error("WebSocket error observed:", event);
        setShowConnectionError(true);
      },
      onMessage: (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "trade" && message.data) {
          setCoins((prevCoins) => {
            const coinsMap = new Map(
              prevCoins.map((coin) => [coin.symbol.toLowerCase(), coin])
            );
            message.data.forEach((trade: any) => {
              const symbol = trade.s
                .split(":")[1]
                .replace("USDT", "")
                .toLowerCase();
              const existingCoin = coinsMap.get(symbol);
              if (existingCoin && existingCoin.current_price !== trade.p) {
                const direction =
                  trade.p > existingCoin.current_price ? "up" : "down";
                coinsMap.set(symbol, {
                  ...existingCoin,
                  current_price: trade.p,
                  price_change_direction: direction,
                });
              }
            });
            return Array.from(coinsMap.values());
          });

          setTimeout(() => {
            setCoins((prevCoins) =>
              prevCoins.map((coin) =>
                coin.price_change_direction
                  ? { ...coin, price_change_direction: "none" }
                  : coin
              )
            );
          }, 500);
        }
      },
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${NUMBER_OF_COINS}&page=1&sparkline=false&x_cg_demo_api_key=${COINGECKO_API_KEY}`
        );
        const data = await response.json();
        setCoins(data);
        const topSymbols = data
          .slice(0, MAX_SUBSCRIPTIONS)
          .map((coin: Coin) => `BINANCE:${coin.symbol.toUpperCase()}USDT`);
        setSubscribedSymbols(topSymbols);
      } catch (error) {
        console.error("Error fetching data from CoinGecko:", error);
      }
    };

    fetchData();

    return () => {
      subscribedSymbolsRef.current.forEach((symbol) => {
        sendMessage(JSON.stringify({ type: "unsubscribe", symbol }));
      });
    };
  }, [sendMessage]);

  const handleSubscriptionToggle = (symbol: string) => {
    const finnhubSymbol = `BINANCE:${symbol.toUpperCase()}USDT`;
    const isSubscribed = subscribedSymbols.includes(finnhubSymbol);

    if (isSubscribed) {
      sendMessage(
        JSON.stringify({ type: "unsubscribe", symbol: finnhubSymbol })
      );
      setSubscribedSymbols(
        subscribedSymbols.filter((s) => s !== finnhubSymbol)
      );
    } else {
      if (subscribedSymbols.length >= MAX_SUBSCRIPTIONS) {
        alert(
          `You can only subscribe to a maximum of ${MAX_SUBSCRIPTIONS} symbols.`
        );
        return;
      }
      sendMessage(JSON.stringify({ type: "subscribe", symbol: finnhubSymbol }));
      setSubscribedSymbols([...subscribedSymbols, finnhubSymbol]);
    }
  };

  const sortedCoins = useMemo(() => {
    const sortableCoins = [...coins];
    sortableCoins.sort((a, b) => {
      if (sortKey === "subscription") {
        const aIsSubscribed = subscribedSymbols.includes(
          `BINANCE:${a.symbol.toUpperCase()}USDT`
        );
        const bIsSubscribed = subscribedSymbols.includes(
          `BINANCE:${b.symbol.toUpperCase()}USDT`
        );

        if (sortDirection === "asc") {
          return Number(aIsSubscribed) - Number(bIsSubscribed);
        } else {
          return Number(bIsSubscribed) - Number(aIsSubscribed);
        }
      }
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
    return sortableCoins;
  }, [coins, sortKey, sortDirection, subscribedSymbols]);

  const handleHeaderClick = (newSortKey: SortKey) => {
    if (newSortKey === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(newSortKey);
      setSortDirection("asc");
    }
  };

  const handleSortKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortKey(e.target.value as SortKey);
  };

  const toggleSortDirection = () => {
    setSortDirection((prevDirection) =>
      prevDirection === "asc" ? "desc" : "asc"
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Tracker</h1>
      </header>
      {showConnectionError && (
        <div className="error-banner">
          WebSocket connection failed. Attempting to reconnect...
        </div>
      )}
      <main>
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={handleSortKeyChange}
          >
            <option value="market_cap_rank">Rank</option>
            <option value="name">Name</option>
            <option value="symbol">Symbol</option>
            <option value="current_price">Value</option>
            <option value="price_change_percentage_24h">24h % Change</option>
            <option value="subscription">Subscription</option>
          </select>
          <button onClick={toggleSortDirection} className="sort-direction-btn">
            {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th
                  className="sortable-header"
                  onClick={() => handleHeaderClick("market_cap_rank")}
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
                  onClick={() => handleHeaderClick("symbol")}
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
                  onClick={() => handleHeaderClick("name")}
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
                  onClick={() => handleHeaderClick("current_price")}
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
                  onClick={() =>
                    handleHeaderClick("price_change_percentage_24h")
                  }
                >
                  24h % Change
                  <span
                    className="sort-arrow"
                    style={{
                      opacity:
                        sortKey === "price_change_percentage_24h" ? 1 : 0,
                    }}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                </th>
                <th
                  className="sortable-header"
                  onClick={() => handleHeaderClick("subscription")}
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
              {sortedCoins.map((coin) => (
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
                      onClick={() => handleSubscriptionToggle(coin.symbol)}
                      className={
                        subscribedSymbols.includes(
                          `BINANCE:${coin.symbol.toUpperCase()}USDT`
                        )
                          ? "unsubscribe-btn"
                          : "subscribe-btn"
                      }
                    >
                      {subscribedSymbols.includes(
                        `BINANCE:${coin.symbol.toUpperCase()}USDT`
                      )
                        ? "Unsubscribe"
                        : "Subscribe"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
