import React from "react";
import { SortDirection, SortKey } from "../types";
import "./SortControls.css";

interface SortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortKeyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortDirectionToggle: () => void;
  filterValue: string;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFilter: () => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionToggle,
  filterValue,
  onFilterChange,
  onClearFilter,
}) => {
  const input = React.useRef<HTMLInputElement>(null);
  const handleClearInput = () => {
    onClearFilter();
    input.current?.focus();
  };
  return (
    <div className="sort-controls">
      <label htmlFor="sort-select">Sort by:</label>
      <select id="sort-select" value={sortKey} onChange={onSortKeyChange}>
        <option value="market_cap_rank">Rank</option>
        <option value="name">Name</option>
        <option value="symbol">Symbol</option>
        <option value="current_price">Value</option>
        <option value="price_change_percentage_24h">24h % Change</option>
        <option value="subscription">Subscription</option>
      </select>
      <button onClick={onSortDirectionToggle} className="sort-direction-btn">
        {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
      </button>

      <div>
        <label htmlFor="filter-input">Filter:</label>
        <input
          id="filter-input"
          type="text"
          value={filterValue}
          onChange={onFilterChange}
          placeholder="Filter by name or symbol"
          ref={input}
          className="filter-input"
        />
      </div>
      {filterValue && (
        <button onClick={handleClearInput} className="clear-filter-btn">
          &times;
        </button>
      )}
    </div>
  );
};
