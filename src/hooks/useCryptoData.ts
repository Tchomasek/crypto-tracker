import { useEffect, useState, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  COINGECKO_API_URL,
  FINNHUB_WS_URL,
  getFinnhubSymbol,
  MAX_SUBSCRIPTIONS,
} from "../constants";
import { Coin } from "../types";

const FLASH_DURATION = 500;

const getInitialSubscribedSymbols = (): string[] => {
  const saved = sessionStorage.getItem("subscribedSymbols");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse subscribedSymbols from sessionStorage", e);
    }
  }
  return [];
};

export const useCryptoData = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>(
    getInitialSubscribedSymbols()
  );
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscribedSymbolsRef = useRef<string[]>([]);
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    subscribedSymbolsRef.current = subscribedSymbols;
  }, [subscribedSymbols]);

  const { sendMessage, readyState } = useWebSocket(FINNHUB_WS_URL, {
    onOpen: () => {
      console.log("connected");
      setShowConnectionError(false);
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
      try {
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

          if (flashTimeoutRef.current) {
            clearTimeout(flashTimeoutRef.current);
          }

          flashTimeoutRef.current = setTimeout(() => {
            setCoins((prevCoins): Coin[] =>
              prevCoins.map((coin) =>
                coin.price_change_direction
                  ? { ...coin, price_change_direction: "none" }
                  : coin
              )
            );
            flashTimeoutRef.current = null;
          }, FLASH_DURATION);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    },
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN && !isLoading) {
      subscribedSymbolsRef.current.forEach((symbol) => {
        sendMessage(JSON.stringify({ type: "subscribe", symbol }));
      });
    }
  }, [readyState, isLoading, sendMessage]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(COINGECKO_API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch data from CoinGecko");
        }
        const data: Coin[] = await response.json();
        setCoins(data);
        if (subscribedSymbolsRef.current.length === 0) {
          const topSymbols = data
            .slice(0, MAX_SUBSCRIPTIONS)
            .map((coin) => getFinnhubSymbol(coin.symbol));
          setSubscribedSymbols(topSymbols);
        }
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching data from CoinGecko:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (readyState === ReadyState.OPEN) {
        subscribedSymbolsRef.current.forEach((symbol) => {
          sendMessage(JSON.stringify({ type: "unsubscribe", symbol }));
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendMessage]);

  useEffect(() => {
    sessionStorage.setItem(
      "subscribedSymbols",
      JSON.stringify(subscribedSymbols)
    );
  }, [subscribedSymbols]);

  // Cleanup flash timeout on unmount
  useEffect(() => {
    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  return {
    coins,
    subscribedSymbols,
    setSubscribedSymbols,
    showConnectionError,
    sendMessage,
    isLoading,
    error,
  };
};
