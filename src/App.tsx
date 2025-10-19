import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import "./App.css";

const coingeckoApiKey = process.env.REACT_APP_COINGECKO_API_KEY;
const finnhubApiKey = process.env.REACT_APP_FINNHUB_API_KEY;

interface Coin {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  image: string;
}

function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const { sendMessage, lastMessage } = useWebSocket(
    `wss://ws.finnhub.io?token=${finnhubApiKey}`,
    {
      onOpen: () => {
        console.log("connected");
        sendMessage(
          JSON.stringify({ type: "subscribe", symbol: "BINANCE:BTCUSDT" })
        );
        sendMessage(
          JSON.stringify({ type: "subscribe", symbol: "BINANCE:ETHUSDT" })
        );
      },
      onMessage: (event) => {
        console.log(event.data);
      },
      shouldReconnect: (closeEvent) => true,
    }
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&x_cg_demo_api_key=${coingeckoApiKey}`
        );
        const data = await response.json();
        setCoins(data);
      } catch (error) {
        console.error("Error fetching data from CoinGecko:", error);
      }
    };

    fetchData();
  }, []);

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
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => (
            <tr key={coin.id}>
              <td>{coin.market_cap_rank}</td>
              <td>
                <img src={coin.image} alt={coin.name} width="30" />
              </td>
              <td>{coin.symbol}</td>
              <td>{coin.name}</td>
              <td>${coin.current_price.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
