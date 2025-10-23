import React from "react";
import { SortDirection, SortKey } from "../types";

interface SortableHeaderProps {
  title: string;
  sortKey: SortKey;
  currentSortKey: SortKey;
  sortDirection: SortDirection;
  onHeaderClick: (newSortKey: SortKey) => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({
  title,
  sortKey,
  currentSortKey,
  sortDirection,
  onHeaderClick,
}) => {
  return (
    <th className="sortable-header" onClick={() => onHeaderClick(sortKey)}>
      {title}
      <span
        className="sort-arrow"
        style={{
          visibility: currentSortKey === sortKey ? "visible" : "hidden",
        }}
      >
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    </th>
  );
};
