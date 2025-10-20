import { useEffect, useState, useRef } from "react";
import useWebSocket from "react-use-websocket";
import {
  COINGECKO_API_URL,
  FINNHUB_WS_URL,
  getFinnhubSymbol,
  MAX_SUBSCRIPTIONS,
} from "../constants";
import { Coin } from "../types";

export const useCryptoData = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const subscribedSymbolsRef = useRef<string[]>([]);

  useEffect(() => {
    subscribedSymbolsRef.current = subscribedSymbols;
  }, [subscribedSymbols]);

  const { sendMessage } = useWebSocket(FINNHUB_WS_URL, {
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
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(COINGECKO_API_URL);
        const data: Coin[] = await response.json();
        setCoins(data);
        const topSymbols = data
          .slice(0, MAX_SUBSCRIPTIONS)
          .map((coin) => getFinnhubSymbol(coin.symbol));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendMessage]);

  return {
    coins,
    subscribedSymbols,
    setSubscribedSymbols,
    showConnectionError,
    sendMessage,
  };
};
