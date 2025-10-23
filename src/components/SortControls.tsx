import React from "react";
import { SortDirection, SortKey } from "../types";
import "./SortControls.css";

interface SortControlsProps {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortKeyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortDirectionToggle: () => void;
  filterValue: string;
  onFilterChange: (filterValue: string) => void;
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
  const [tempFilterValue, setTempFilterValue] = React.useState(filterValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFilterValue(e.target.value);
  };

  const handleConfirmFilter = () => {
    onFilterChange(tempFilterValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleConfirmFilter();
    }
  };

  React.useEffect(() => {
    setTempFilterValue(filterValue);
  }, [filterValue]);
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

      <div className="filter-container">
        <label htmlFor="filter-input">Filter:</label>
        <input
          id="filter-input"
          type="text"
          value={tempFilterValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Filter by name or symbol"
          ref={input}
          className="filter-input"
        />
        <button onClick={handleConfirmFilter} className="confirm-filter-btn">
          Filter
        </button>
      </div>
    </div>
  );
};
