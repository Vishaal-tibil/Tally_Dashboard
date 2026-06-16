import React from "react";
import DataSourceBadge from "./DataSourceBadge";

export default function SectionHeader({ title, sub, source, accent }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start",
      justifyContent: "space-between", marginBottom: 18, gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* coloured accent bar */}
        <div style={{
          width: 3, borderRadius: 4, alignSelf: "stretch", minHeight: 32,
          flexShrink: 0,
          background: accent ?? "var(--accent-blue)",
          marginTop: 2,
        }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.2px" }}>
            {title}
          </div>
          {sub && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{sub}</div>
          )}
        </div>
      </div>
      {source && <DataSourceBadge source={source} />}
    </div>
  );
}
