import { useEffect, useState } from "react";
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

function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const { sendMessage, readyState } = useWebSocket(
    `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`,
    {
      onOpen: () => {
        console.log("connected");
        subscribedSymbols.forEach((symbol) => {
          sendMessage(JSON.stringify({ type: "subscribe", symbol }));
        });
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
          }, 1000);
        }
      },
      shouldReconnect: (closeEvent) => true,
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=${COINGECKO_API_KEY}`
        );
        const data = await response.json();
        setCoins(data);
        const top5Symbols = data
          .slice(0, 5)
          .map((coin: Coin) => `BINANCE:${coin.symbol.toUpperCase()}USDT`);
        setSubscribedSymbols(top5Symbols);
      } catch (error) {
        console.error("Error fetching data from CoinGecko:", error);
      }
    };

    fetchData();
  }, []);



  const handleSubscriptionToggle = (symbol: string) => {
    const finnhubSymbol = `BINANCE:${symbol.toUpperCase()}USDT`;
    const isSubscribed = subscribedSymbols.includes(finnhubSymbol);

    if (isSubscribed) {
      sendMessage(JSON.stringify({ type: "unsubscribe", symbol: finnhubSymbol }));
      setSubscribedSymbols(subscribedSymbols.filter((s) => s !== finnhubSymbol));
    } else {
      if (subscribedSymbols.length >= 5) {
        alert("You can only subscribe to a maximum of 5 symbols.");
        return;
      }
      sendMessage(JSON.stringify({ type: "subscribe", symbol: finnhubSymbol }));
      setSubscribedSymbols([...subscribedSymbols, finnhubSymbol]);
    }
  };

  return (
    <div className="App">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th></th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Value</th>
            <th>24h % Change</th>
            <th>Actions</th>
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
              <td>{coin.market_cap_rank}</td>
              <td>
                <img src={coin.image} alt={coin.name} width="30" />
              </td>
              <td>{coin.symbol}</td>
              <td>{coin.name}</td>
              <td>${coin.current_price.toLocaleString()}</td>
              <td
                style={{
                  color: coin.price_change_percentage_24h > 0 ? "green" : "red",
                }}
              >
                {coin.price_change_percentage_24h.toFixed(2)}%
              </td>
              <td>
                <button onClick={() => handleSubscriptionToggle(coin.symbol)}>
                  {subscribedSymbols.includes(`BINANCE:${coin.symbol.toUpperCase()}USDT`)
                    ? "Unsubscribe"
                    : "Subscribe"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
