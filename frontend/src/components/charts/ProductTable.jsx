import React from "react";
import { useApp } from "../../context/AppContext";

function fmt(v) {
  if (!v) return "₹0";
  const n = Math.abs(v);
  if (n >= 1e7) return `₹${(v/1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(v/1e5).toFixed(1)}L`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
}

const s = {
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    textAlign: "left", padding: "9px 12px", fontSize: 11,
    color: "var(--text-muted)", textTransform: "uppercase",
    borderBottom: "1px solid var(--border)",
  },
  td: { padding: "9px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" },
  badge: (type) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10,
    background: type?.toLowerCase().includes("sale") ? "#3b82f615" : "#f59e0b15",
    color:      type?.toLowerCase().includes("sale") ? "#3b82f6"   : "#f59e0b",
    border:     `1px solid ${type?.toLowerCase().includes("sale") ? "#3b82f640" : "#f59e0b40"}`,
  }),
};

export default function ProductTable() {
  const { data } = useApp();
  const items = data?.products?.top_items ?? [];

  if (!items.length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No product data</div>;

  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Product</th>
          <th style={s.th}>Type</th>
          <th style={{ ...s.th, textAlign: "right" }}>Txns</th>
          <th style={{ ...s.th, textAlign: "right" }}>Value</th>
        </tr>
      </thead>
      <tbody>
        {items.map((r, i) => (
          <tr key={i}>
            <td style={s.td}>{r.stock_item}</td>
            <td style={s.td}><span style={s.badge(r.voucher_type)}>{r.voucher_type}</span></td>
            <td style={{ ...s.td, textAlign: "right" }}>{r.lines}</td>
            <td style={{ ...s.td, textAlign: "right" }}>{fmt(r.total_amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
