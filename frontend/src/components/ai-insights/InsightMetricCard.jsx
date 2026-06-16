import React from "react";

const COLOR = { positive: "var(--accent-green)", negative: "var(--accent-red)", neutral: "var(--text-secondary)" };

const s = {
  card: {
    flex: 1, padding: "12px",
    background: "var(--bg-primary)", border: "1px solid var(--border-light)", borderRadius: 8,
  },
  label: { fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 },
  value: (h) => ({ fontSize: 16, fontWeight: 700, color: COLOR[h] ?? COLOR.neutral }),
};

export default function InsightMetricCard({ label, value, highlight }) {
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={s.value(highlight)}>{value}</div>
    </div>
  );
}
