import React from "react";
import { TrendingUp, ShoppingCart, BarChart2, ArrowDownLeft, ArrowUpRight, Landmark } from "lucide-react";
import KpiCard from "./KpiCard";
import { useApp } from "../../context/AppContext";
import { useFilteredData } from "../../hooks/useFilteredData";

function fmt(v, allowNeg = false) {
  if (v === undefined || v === null) return "—";
  const n = Math.abs(v);
  const str = n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr`
            : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L`
            : `₹${n.toLocaleString("en-IN")}`;
  return (allowNeg && v < 0) ? `−${str}` : str;
}

export default function KpiRow() {
  const { data, filters } = useApp();
  const filtered = useFilteredData();
  if (!data) return null;
  const { summary, sources } = data;
  const isFiltered = filters.dateFrom || filters.dateTo || filters.party;
  const rev = isFiltered ? filtered.rev : summary.total_revenue;
  const pur = isFiltered ? filtered.pur : summary.total_purchases;
  const gm  = isFiltered ? filtered.gm  : summary.gross_margin_pct;
  const salesCount = isFiltered ? filtered.sales.length : (data.sales?.invoices?.length ?? 0);
  const purchCount = isFiltered ? filtered.purchases.length : (data.purchases?.invoices?.length ?? 0);

  const cards = [
    {
      label:  "Total Revenue",
      value:  fmt(rev),
      accent: "var(--accent-blue)",
      icon:   TrendingUp,
      sub:    `${salesCount} invoices · sales_register.csv`,
      source: sources?.sales,
    },
    {
      label:  "Total Purchases",
      value:  fmt(pur),
      accent: "var(--accent-amber)",
      icon:   ShoppingCart,
      sub:    `${purchCount} bills · purchase_register.csv`,
      source: sources?.purchases,
    },
    {
      label:  "Gross Margin",
      value:  gm != null ? `${gm}%` : "—",
      accent: gm < 0 ? "var(--accent-red)" : "var(--accent-green)",
      icon:   BarChart2,
      sub:    gm < 0 ? "Purchases exceed revenue (stock build-up)" : "Revenue − Purchases",
    },
    {
      label:  "Receivables (Bills)",
      value:  fmt(summary.net_receivables),
      accent: "var(--accent-red)",
      icon:   ArrowDownLeft,
      sub:    "outstanding_comparative.csv",
      source: sources?.outstanding,
    },
    {
      label:  "Payables (Ledger)",
      value:  fmt(summary.net_payables),
      accent: "var(--accent-purple)",
      icon:   ArrowUpRight,
      sub:    "Sundry Creditors · ledgers.csv",
      source: sources?.ledgers,
    },
    {
      label:  "Cash & Bank",
      value:  fmt(summary.cash_bank, true),
      accent: summary.cash_bank < 0 ? "var(--accent-red)" : "var(--accent-teal)",
      icon:   Landmark,
      sub:    summary.cash_bank < 0
        ? "Net overdraft (credit balances) · ledgers.csv"
        : "Bank Accounts + Cash · ledgers.csv",
      source: sources?.ledgers,
    },
  ];

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
      {cards.map((c) => (
        <div key={c.label} style={{ flex: "1 1 155px", minWidth: 145 }}>
          <KpiCard {...c} />
        </div>
      ))}
    </div>
  );
}
