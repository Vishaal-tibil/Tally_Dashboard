import React from "react";
import { useApp } from "../context/AppContext";
import KpiRow         from "../components/kpi/KpiRow";
import SectionHeader  from "../components/common/SectionHeader";
import SalesChart     from "../components/charts/SalesChart";
import PurchaseChart  from "../components/charts/PurchaseChart";
import OutstandingChart from "../components/charts/OutstandingChart";
import GstChart       from "../components/charts/GstChart";
import CashBankCard   from "../components/charts/CashBankCard";
import ProductTable   from "../components/charts/ProductTable";

const card = (accent) => ({
  background:   "var(--bg-card)",
  border:       "1px solid var(--border)",
  borderRadius: 14,
  padding:      "22px 24px",
  marginBottom: 0,
  boxShadow:    "0 1px 6px rgba(0,0,0,0.05)",
  borderTop:    accent ? `3px solid ${accent}` : "1px solid var(--border)",
});

function OutstandingTable({ rows }) {
  if (!rows?.length) return <div style={{ color: "var(--text-muted)", padding: "8px 0", fontSize: 12 }}>No outstanding bills</div>;

  const s = {
    table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
    th:    { textAlign: "left", padding: "6px 10px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border)", whiteSpace: "nowrap" },
    td:    { padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" },
    tdRed: { padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--accent-red)", fontWeight: 600 },
    ageTag: (bucket) => {
      const c = { "90+": "#a855f7", "61-90": "#ef4444", "31-60": "#f59e0b", "0-30": "#22c55e" };
      const col = c[bucket] ?? "#64748b";
      return { display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, background: col + "20", color: col, border: `1px solid ${col}50` };
    },
    overdueTag: { display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, background: "#ef444420", color: "#ef4444", border: "1px solid #ef444450" },
    okTag:      { display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e50" },
  };

  const fmt = (v) => {
    const n = Math.abs(v ?? 0);
    return n >= 1e7 ? `₹${(v/1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : `₹${Number(v ?? 0).toLocaleString("en-IN")}`;
  };

  return (
    <table style={s.table}>
      <thead>
        <tr>
          <th style={s.th}>Party</th>
          <th style={s.th}>Bill Ref</th>
          <th style={s.th}>Bill Date</th>
          <th style={s.th}>Due Date</th>
          <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
          <th style={{ ...s.th, textAlign: "center" }}>Bill Age</th>
          <th style={{ ...s.th, textAlign: "center" }}>Overdue</th>
          <th style={s.th}>Type</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={r.is_overdue ? { background: "#ef444405" } : {}}>
            <td style={r.is_overdue ? s.tdRed : s.td}>{r.party}</td>
            <td style={s.td}>{r.bill_ref ?? "—"}</td>
            <td style={s.td}>{r.bill_date ?? "—"}</td>
            <td style={s.td}>{r.due_date ?? "—"}</td>
            <td style={{ ...s.td, textAlign: "right" }}>{fmt(r.pending_amount)}</td>
            <td style={{ ...s.td, textAlign: "center" }}>
              <span style={s.ageTag(r.ageing_bucket)}>{r.ageing_bucket} days</span>
            </td>
            <td style={{ ...s.td, textAlign: "center" }}>
              {r.days_overdue != null
                ? r.is_overdue
                  ? <span style={s.overdueTag}>{r.days_overdue}d overdue</span>
                  : <span style={s.okTag}>Due in {Math.abs(r.days_overdue)}d</span>
                : <span style={{ color: "var(--text-muted)" }}>—</span>
              }
            </td>
            <td style={s.td}>{r.outstanding_type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Overview() {
  const { data, activeSection } = useApp();
  if (!data) return null;

  const { sources } = data;

  const sections = {
    overview:    renderOverview,
    sales:       renderSales,
    purchases:   renderPurchases,
    outstanding: renderOutstanding,
    gst:         renderGst,
    "cash-bank": renderCashBank,
    products:    renderProducts,
    "ai-insights": renderAiHint,
  };

  const render = sections[activeSection] ?? renderOverview;
  return <div>{render(data, sources)}</div>;

  function renderOverview(data, sources) {
    return (
      <>
        <div style={{ marginBottom: 22 }}>
          <KpiRow />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card("#2563eb")}>
            <SectionHeader title="Sales by Party" source={sources?.sales} accent="#2563eb" />
            <SalesChart />
          </div>
          <div style={card("#d97706")}>
            <SectionHeader title="Purchases by Party" source={sources?.purchases} accent="#d97706" />
            <PurchaseChart />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={card("#7c3aed")}>
            <SectionHeader title="Outstanding Ageing" source={sources?.outstanding} accent="#7c3aed" />
            <OutstandingChart />
          </div>
          <div style={card("#0d9488")}>
            <SectionHeader title="GST Summary" source={sources?.ledgers} accent="#0d9488" />
            <GstChart />
          </div>
        </div>

        <div style={{ ...card("#0891b2"), marginBottom: 16 }}>
          <SectionHeader title="Cash & Bank" source={sources?.ledgers} accent="#0891b2" />
          <CashBankCard />
        </div>

        <div style={card("#16a34a")}>
          <SectionHeader title="Top Products" source={sources?.inventory} accent="#16a34a" />
          <ProductTable />
        </div>
      </>
    );
  }

  function renderSales(data, sources) {
    const invoices = data.sales?.invoices ?? [];
    const fmt = (v) => {
      const n = Math.abs(v ?? 0);
      return n >= 1e7 ? `₹${(v/1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : `₹${Number(v).toLocaleString("en-IN")}`;
    };
    return (
      <div style={card("#2563eb")}>
        <SectionHeader title="Sales Register" sub={`${invoices.length} invoice lines`} source={sources?.sales} accent="#2563eb" />
        <SalesChart />
        <div style={{ height: 20 }} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Date","Invoice#","Party","Taxable","Tax","Total"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "7px 10px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.date}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.voucher_number}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.party_ledger}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", textAlign: "right" }}>{fmt(r.taxable_value)}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", textAlign: "right" }}>{fmt(r.tax_amount)}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{fmt(r.invoice_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderPurchases(data, sources) {
    const invoices = data.purchases?.invoices ?? [];
    const fmt = (v) => {
      const n = Math.abs(v ?? 0);
      return n >= 1e7 ? `₹${(v/1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : `₹${Number(v).toLocaleString("en-IN")}`;
    };
    return (
      <div style={card("#d97706")}>
        <SectionHeader title="Purchase Register" sub={`${invoices.length} invoice lines`} source={sources?.purchases} accent="#d97706" />
        <PurchaseChart />
        <div style={{ height: 20 }} />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              {["Date","Invoice#","Party","Taxable","Tax","Total"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "7px 10px", color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map((r, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.date}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.voucher_number}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)" }}>{r.party_ledger}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", textAlign: "right" }}>{fmt(r.taxable_value)}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", textAlign: "right" }}>{fmt(r.tax_amount)}</td>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-primary)", fontWeight: 600, textAlign: "right" }}>{fmt(r.invoice_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderOutstanding(data, sources) {
    const rows = data.outstanding?.rows ?? [];
    return (
      <div style={card("#7c3aed")}>
        <SectionHeader title="Outstanding Bills" sub={`${rows.length} bills`} source={sources?.outstanding} accent="#7c3aed" />
        <div style={{ marginBottom: 20 }}>
          <OutstandingChart />
        </div>
        <OutstandingTable rows={rows} />
      </div>
    );
  }

  function renderGst(data, sources) {
    return (
      <div style={card("#0d9488")}>
        <SectionHeader title="GST Summary" source={sources?.ledgers} accent="#0d9488" />
        <GstChart />
      </div>
    );
  }

  function renderCashBank(data, sources) {
    return (
      <div style={card("#0891b2")}>
        <SectionHeader title="Cash & Bank" source={sources?.ledgers} accent="#0891b2" />
        <CashBankCard />
      </div>
    );
  }

  function renderProducts(data, sources) {
    const tv = data?.products?.total_stock_value;
    return (
      <div style={card("#16a34a")}>
        <SectionHeader
          title="Products"
          sub={tv ? `Stock on hand: ₹${(tv/1e5).toFixed(1)}L` : undefined}
          source={sources?.inventory}
          accent="#16a34a"
        />
        <ProductTable />
      </div>
    );
  }

  function renderAiHint() {
    return (
      <div style={{ ...card(), textAlign: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 8 }}>
          AI Insights are in the right panel →
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Click the <strong style={{ color: "var(--accent-blue)" }}>Insights</strong> or <strong style={{ color: "var(--accent-blue)" }}>Chat</strong> tab on the right to interact with your Tally data.
        </div>
      </div>
    );
  }
}
