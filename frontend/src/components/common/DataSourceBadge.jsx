import React, { useState } from "react";
import { Database, ChevronDown } from "lucide-react";

const CONF_COLOR = { high: "#16a34a", medium: "#d97706", low: "#dc2626" };
const CONF_LABEL = { high: "Fresh", medium: "Recent", low: "Stale" };

// Plain description of what data each CSV contains (pulled via Tally XML gateway localhost:9000)
const TALLY_SOURCE = {
  "ledgers.csv":                 "All ledger closing balances — pulled via Tally XML gateway (localhost:9000)",
  "sales_register.csv":          "Sales vouchers with party, taxable value, GST & invoice total",
  "purchase_register.csv":       "Purchase vouchers with party, taxable value, GST & invoice total",
  "outstanding_comparative.csv": "Pending receivable & payable bills as on a given date",
  "voucher_inventory.csv":       "Inventory line items (stock item, qty, rate, amount) from vouchers",
};

export default function DataSourceBadge({ source }) {
  const [open, setOpen] = useState(false);
  if (!source) return null;

  const conf  = source.confidence ?? "low";
  const color = CONF_COLOR[conf];

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 8px 3px 6px", borderRadius: 20,
          background: `${color}0d`, border: `1px solid ${color}30`,
          fontSize: 11, color: "var(--text-secondary)",
          cursor: "pointer", userSelect: "none",
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <Database size={10} style={{ color }} />
        <span style={{ color, fontWeight: 600 }}>{CONF_LABEL[conf]}</span>
        <span>· {source.file}</span>
        {source.rows != null && <span>· {source.rows} rows</span>}
        <ChevronDown size={10} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 50,
          background: "var(--bg-secondary)", border: "1px solid var(--border-light)",
          borderRadius: 8, padding: "10px 12px", minWidth: 260,
          boxShadow: "var(--shadow-md)", fontSize: 11,
        }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>CSV File</div>
          <div style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: 8 }}>{source.file}</div>
          <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Extracted via</div>
          <div style={{ color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
            {TALLY_SOURCE[source.file] ?? "Tally ERP XML Gateway"}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Rows</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{source.rows ?? 0}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Last Updated</div>
              <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>{source.updated ?? "—"}</div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Confidence</div>
              <div style={{ color, fontWeight: 600 }}>{CONF_LABEL[conf]}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
