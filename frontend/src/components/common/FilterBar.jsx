import React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useAllParties } from "../../hooks/useFilteredData";

export default function FilterBar() {
  const { filters, dispatch } = useApp();
  const parties = useAllParties();

  const set  = (key, val) => dispatch({ type: "SET_FILTER", payload: { [key]: val } });
  const reset = () => dispatch({ type: "RESET_FILTERS" });

  const active = filters.dateFrom || filters.dateTo || filters.party;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 20px",
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      flexShrink: 0,
    }}>
      <SlidersHorizontal size={13} color="var(--text-muted)" />
      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginRight: 4 }}>
        FILTER
      </span>

      {/* Date From */}
      <input
        type="date"
        value={filters.dateFrom}
        onChange={(e) => set("dateFrom", e.target.value)}
        style={inputStyle}
        title="From date"
      />
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>to</span>

      {/* Date To */}
      <input
        type="date"
        value={filters.dateTo}
        onChange={(e) => set("dateTo", e.target.value)}
        style={inputStyle}
        title="To date"
      />

      {/* divider */}
      <div style={{ width: 1, height: 18, background: "var(--border-light)" }} />

      {/* Party */}
      <select
        value={filters.party}
        onChange={(e) => set("party", e.target.value)}
        style={{ ...inputStyle, minWidth: 160 }}
      >
        <option value="">All parties</option>
        {parties.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      {/* Reset */}
      {active && (
        <button
          onClick={reset}
          style={{
            display: "flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 6,
            background: "#dc262610", border: "1px solid #dc262630",
            color: "#dc2626", fontSize: 11, fontWeight: 500,
          }}
        >
          <X size={11} /> Clear
        </button>
      )}

      {active && (
        <span style={{
          fontSize: 10, color: "var(--accent-blue)", fontWeight: 600,
          background: "#2563eb10", padding: "2px 8px", borderRadius: 10,
          border: "1px solid #2563eb25",
        }}>
          Filtered
        </span>
      )}
    </div>
  );
}

const inputStyle = {
  padding: "4px 8px", borderRadius: 6, fontSize: 12,
  border: "1px solid var(--border-light)",
  background: "var(--bg-primary)", color: "var(--text-primary)",
  outline: "none",
};
