import React from "react";
import { Dot } from "lucide-react";

const s = {
  row:  { display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid var(--border)" },
  icon: { color: "var(--accent-blue)", flexShrink: 0, marginTop: 2 },
  text: { fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 },
};

export default function InsightBullet({ text }) {
  return (
    <div style={s.row}>
      <Dot size={16} style={s.icon} />
      <span style={s.text}>{text}</span>
    </div>
  );
}
