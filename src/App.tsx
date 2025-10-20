import { useState, useMemo, useEffect } from "react";
import "./App.css";
import { SortKey, SortDirection, Coin } from "./types";
import { useCryptoData } from "./hooks/useCryptoData";
import { getFinnhubSymbol, MAX_SUBSCRIPTIONS } from "./constants";
import { ConnectionErrorBanner } from "./components/ConnectionErrorBanner";
import { SortControls } from "./components/SortControls";
import { CoinTable } from "./components/CoinTable";

function App() {
  const {
    coins,
    subscribedSymbols,
    setSubscribedSymbols,
    showConnectionError,
    sendMessage,
  } = useCryptoData();

  const [sortKey, setSortKey] = useState<SortKey>(
    () => (sessionStorage.getItem("sortKey") as SortKey) || "market_cap_rank"
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    () => (sessionStorage.getItem("sortDirection") as SortDirection) || "asc"
  );

  useEffect(() => {
    sessionStorage.setItem("sortKey", sortKey);
  }, [sortKey]);

  useEffect(() => {
    sessionStorage.setItem("sortDirection", sortDirection);
  }, [sortDirection]);

  const handleSubscriptionToggle = (symbol: string) => {
    const finnhubSymbol = getFinnhubSymbol(symbol);
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
    return [...coins].sort((a, b) => {
      if (sortKey === "subscription") {
        const aIsSubscribed = subscribedSymbols.includes(
          getFinnhubSymbol(a.symbol)
        );
        const bIsSubscribed = subscribedSymbols.includes(
          getFinnhubSymbol(b.symbol)
        );

        if (sortDirection === "asc") {
          return Number(aIsSubscribed) - Number(bIsSubscribed);
        } else {
          return Number(bIsSubscribed) - Number(aIsSubscribed);
        }
      }
      const aValue = a[sortKey as keyof Coin];
      const bValue = b[sortKey as keyof Coin];

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

  const handleSortDirectionToggle = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Crypto Tracker</h1>
      </header>
      {showConnectionError && <ConnectionErrorBanner />}
      <main>
        <SortControls
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortKeyChange={handleSortKeyChange}
          onSortDirectionToggle={handleSortDirectionToggle}
        />
        <CoinTable
          coins={sortedCoins}
          subscribedSymbols={subscribedSymbols}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onHeaderClick={handleHeaderClick}
          onSubscriptionToggle={handleSubscriptionToggle}
        />
      </main>
    </div>
  );
}

export default App;
