import React from "react";
import { useApp } from "../../context/AppContext";
import { AlertTriangle } from "lucide-react";

function fmt(v) {
  if (v === null || v === undefined) return "—";
  const n = Math.abs(v);
  const str = n >= 1e7 ? `₹${(Math.abs(v)/1e7).toFixed(2)} Cr`
            : n >= 1e5 ? `₹${(Math.abs(v)/1e5).toFixed(1)}L`
            : `₹${Math.abs(Number(v)).toLocaleString("en-IN")}`;
  return v < 0 ? `−${str}` : str;
}

export default function CashBankCard() {
  const { data } = useApp();
  const accounts = data?.cash_bank?.accounts ?? [];
  const total    = data?.cash_bank?.total ?? 0;

  if (!accounts.length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No cash/bank data</div>;

  return (
    <div>
      {/* Summary bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px", borderRadius: 8, marginBottom: 14,
        background: total < 0 ? "#dc262608" : "#16a34a08",
        border: `1px solid ${total < 0 ? "#dc262630" : "#16a34a30"}`,
      }}>
        {total < 0 && <AlertTriangle size={14} color="#dc2626" />}
        <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Net Cash Position</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: total < 0 ? "#dc2626" : "#16a34a", marginLeft: "auto" }}>
          {fmt(total)}
        </span>
        {total < 0 && (
          <span style={{ fontSize: 11, color: "#dc2626" }}>Net overdraft</span>
        )}
      </div>

      {/* Per-account cards */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {accounts.map((a, i) => {
          const overdraft = a.is_overdraft;
          const color = overdraft ? "#dc2626" : (a.parent_group === "Bank Accounts" ? "#2563eb" : "#0d9488");
          return (
            <div key={i} style={{
              flex: "1 1 190px", padding: "14px 16px",
              background: "var(--bg-primary)", borderRadius: 8,
              border: `1px solid ${color}25`,
              borderTop: `2px solid ${color}`,
            }}>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>
                {a.ledger_name}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: overdraft ? "#dc2626" : "var(--text-primary)" }}>
                {fmt(a.closing_balance)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{a.parent_group}</span>
                {overdraft && (
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 8,
                    background: "#dc262615", color: "#dc2626",
                    border: "1px solid #dc262630",
                  }}>Overdraft / Credit balance</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
