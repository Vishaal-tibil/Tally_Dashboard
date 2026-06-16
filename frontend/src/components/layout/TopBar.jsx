import React from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

const LABELS = {
  overview: "Tally Dashboard", sales: "Sales Register", purchases: "Purchase Register",
  outstanding: "Outstanding", gst: "GST Summary", "cash-bank": "Cash & Bank",
  products: "Products", "ai-insights": "AI Insights",
};

export default function TopBar() {
  const { loading, fetchData, data, activeSection, rightPanelOpen, rightPanel, dispatch } = useApp();

  return (
    <div style={{
      height: "var(--topbar-height)",
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border)",
      display: "flex", alignItems: "center",
      padding: "0 18px", gap: 12, flexShrink: 0,
      boxShadow: "var(--shadow-sm)",
    }}>
      <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
        {LABELS[activeSection] ?? "Dashboard"}
      </span>

      {/* Tally live source indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: "#16a34a0d", border: "1px solid #16a34a30",
        fontSize: 11, color: "#16a34a", fontWeight: 500,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
        Tally XML · localhost:9000
      </div>


      <button
        onClick={fetchData}
        disabled={loading}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 6,
          background: "var(--accent-blue)", color: "#fff",
          fontSize: 12, fontWeight: 500, opacity: loading ? 0.7 : 1,
        }}
      >
        <RefreshCw
          size={12}
          style={loading ? { animation: "spin 1s linear infinite" } : {}}
        />
        {loading ? "Syncing…" : "Refresh"}
      </button>

      <button
        onClick={() => dispatch({ type: "TOGGLE_RIGHT" })}
        title={rightPanelOpen ? "Close AI panel" : "Open AI panel"}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8, flexShrink: 0,
          background: rightPanelOpen ? "linear-gradient(135deg,#7c3aed,#2563eb)" : "var(--bg-primary)",
          color: rightPanelOpen ? "#fff" : "var(--text-secondary)",
          border: rightPanelOpen ? "none" : "1px solid var(--border)",
          fontWeight: 600, fontSize: 12,
          boxShadow: rightPanelOpen ? "0 2px 8px #7c3aed40" : "none",
          transition: "all 0.2s",
        }}
      >
        <Sparkles size={13} />
        AI
      </button>
    </div>
  );
}
