import React from "react";
import { useApp } from "../../context/AppContext";

function fmt(v) {
  if (!v) return "₹0";
  const n = Math.abs(v);
  if (n >= 1e7) return `₹${(v/1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(v/1e5).toFixed(1)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const s = {
  row: { display: "flex", gap: 12, marginBottom: 12 },
  box: (color) => ({
    flex: 1, padding: "14px 16px", borderRadius: 8,
    background: "var(--bg-primary)", border: `1px solid ${color}30`,
    borderLeft: `3px solid ${color}`,
  }),
  label: { fontSize: 11, color: "var(--text-muted)", marginBottom: 6 },
  val:   { fontSize: 18, fontWeight: 700, color: "var(--text-primary)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12, marginTop: 12 },
  th:    { textAlign: "left", color: "var(--text-muted)", padding: "6px 8px", borderBottom: "1px solid var(--border)" },
  td:    { padding: "7px 8px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" },
};

export default function GstChart() {
  const { data } = useApp();
  if (!data?.gst) return null;
  const { input, output, other, input_total, output_total, net_payable } = data.gst;
  const all = [...(output ?? []), ...(input ?? []), ...(other ?? [])];

  return (
    <div>
      <div style={s.row}>
        <div style={s.box("#f59e0b")}>
          <div style={s.label}>GST Output (Collected)</div>
          <div style={s.val}>{fmt(output_total)}</div>
        </div>
        <div style={s.box("#22c55e")}>
          <div style={s.label}>GST Input (Paid)</div>
          <div style={s.val}>{fmt(input_total)}</div>
        </div>
        <div style={s.box(net_payable > 0 ? "#ef4444" : "#22c55e")}>
          <div style={s.label}>Net Payable</div>
          <div style={{ ...s.val, color: net_payable > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
            {fmt(net_payable)}
          </div>
        </div>
      </div>

      {all.length > 0 && (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Ledger</th>
              <th style={{ ...s.th, textAlign: "right" }}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {all.map((r, i) => (
              <tr key={i}>
                <td style={s.td}>{r.ledger_name}</td>
                <td style={{ ...s.td, textAlign: "right" }}>{fmt(r.closing_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
