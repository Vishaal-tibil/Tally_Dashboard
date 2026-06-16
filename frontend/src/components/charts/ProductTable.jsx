import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { useApp } from "../../context/AppContext";

function fmtAmt(v) {
  if (v == null) return "—";
  const n = Math.abs(v);
  if (n >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  return `₹${Number(v).toLocaleString("en-IN")}`;
}
function fmtQty(q, unit) {
  if (q == null) return "—";
  return `${Number(q).toLocaleString("en-IN")} ${unit ?? ""}`.trim();
}

const TH = { textAlign: "left", padding: "8px 12px", fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" };
const TD = { padding: "9px 12px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: 13 };

function barChart(labels, values, color) {
  return {
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: color + "bb", borderColor: color, borderWidth: 1, borderRadius: 4 }],
    },
    opts: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => " " + fmtAmt(c.raw) } } },
      scales: {
        x: { ticks: { color: "#64748b", font: { size: 11 } }, grid: { color: "#e2e8f0" } },
        y: { ticks: { color: "#475569", font: { size: 12 } }, grid: { display: false } },
      },
    },
  };
}

function SalesTab({ items }) {
  if (!items?.length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No sales product data</div>;
  const { data: chartData, opts } = barChart(items.map((i) => i.stock_item), items.map((i) => i.revenue), "#3b82f6");
  return (
    <>
      <div style={{ height: Math.max(160, items.length * 42 + 40), marginBottom: 20 }}>
        <Bar data={chartData} options={opts} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={TH}>Product</th>
            <th style={{ ...TH, textAlign: "right" }}>Qty Sold</th>
            <th style={{ ...TH, textAlign: "right" }}>Revenue</th>
            <th style={{ ...TH, textAlign: "right" }}>Avg Rate</th>
            <th style={{ ...TH, textAlign: "right" }}>Invoices</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td style={TD}>{r.stock_item}</td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtQty(r.qty_sold, r.unit)}</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{fmtAmt(r.revenue)}</td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtAmt(r.avg_sell_rate)}</td>
              <td style={{ ...TD, textAlign: "right" }}>{r.txns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function PurchasesTab({ items }) {
  if (!items?.length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No purchase product data</div>;
  const { data: chartData, opts } = barChart(items.map((i) => i.stock_item), items.map((i) => i.cost), "#f59e0b");
  return (
    <>
      <div style={{ height: Math.max(160, items.length * 42 + 40), marginBottom: 20 }}>
        <Bar data={chartData} options={opts} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={TH}>Product</th>
            <th style={{ ...TH, textAlign: "right" }}>Qty Purchased</th>
            <th style={{ ...TH, textAlign: "right" }}>Cost</th>
            <th style={{ ...TH, textAlign: "right" }}>Avg Rate</th>
            <th style={{ ...TH, textAlign: "right" }}>Bills</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td style={TD}>{r.stock_item}</td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtQty(r.qty_purchased, r.unit)}</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{fmtAmt(r.cost)}</td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtAmt(r.avg_buy_rate)}</td>
              <td style={{ ...TD, textAlign: "right" }}>{r.txns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function StockTab({ items, totalValue }) {
  if (!items?.length) return (
    <div style={{ color: "var(--text-muted)", padding: 16, fontSize: 13 }}>
      No stock summary yet — run <code>tally_final.py</code> to pull stock data from Tally.
    </div>
  );
  return (
    <>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#16a34a0d", border: "1px solid #16a34a30",
        borderRadius: 8, padding: "6px 14px", marginBottom: 16, fontSize: 12,
      }}>
        <span style={{ color: "var(--text-muted)" }}>Total Stock Value</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: "#16a34a" }}>{fmtAmt(totalValue)}</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            <th style={TH}>Stock Item</th>
            <th style={TH}>Group</th>
            <th style={{ ...TH, textAlign: "right" }}>Opening Qty</th>
            <th style={{ ...TH, textAlign: "right" }}>Closing Qty</th>
            <th style={{ ...TH, textAlign: "right" }}>Rate</th>
            <th style={{ ...TH, textAlign: "right" }}>Stock Value</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, i) => (
            <tr key={i}>
              <td style={TD}>{r.stock_item}</td>
              <td style={{ ...TD, color: "var(--text-muted)", fontSize: 12 }}>{r.stock_group ?? "—"}</td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtQty(r.opening_qty, r.unit)}</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: r.closing_qty > 0 ? "var(--text-primary)" : "var(--accent-red)" }}>
                {fmtQty(r.closing_qty, r.unit)}
              </td>
              <td style={{ ...TD, textAlign: "right" }}>{fmtAmt(r.closing_rate)}</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>{fmtAmt(r.closing_value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const TABS = [
  { id: "sales",     label: "Sales by Product",    color: "#2563eb" },
  { id: "purchases", label: "Purchases by Product", color: "#d97706" },
  { id: "stock",     label: "Stock on Hand",        color: "#16a34a" },
];

export default function ProductTable() {
  const { data } = useApp();
  const [tab, setTab] = useState("sales");
  const products = data?.products ?? {};

  return (
    <div>
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "6px 16px", fontSize: 12, fontWeight: 600,
              borderRadius: "6px 6px 0 0", border: "1px solid transparent",
              borderBottom: tab === t.id ? `2px solid ${t.color}` : "none",
              background: tab === t.id ? t.color + "12" : "transparent",
              color: tab === t.id ? t.color : "var(--text-muted)",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "sales"     && <SalesTab     items={products.sales_items}    />}
      {tab === "purchases" && <PurchasesTab  items={products.purchase_items} />}
      {tab === "stock"     && <StockTab      items={products.stock_items}    totalValue={products.total_stock_value} />}
    </div>
  );
}
