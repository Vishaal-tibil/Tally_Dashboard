import React from "react";

export default function KpiCard({ label, value, sub, accent, source, icon: Icon }) {
  const color = accent ?? "var(--accent-blue)";

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "18px 20px",
      flex: 1,
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* top accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: color, borderRadius: "14px 14px 0 0",
      }} />

      {/* subtle tinted bg at top-right */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80, borderRadius: "0 14px 0 80px",
        background: `${color}0d`,
        pointerEvents: "none",
      }} />

      {/* icon */}
      {Icon && (
        <div style={{
          position: "absolute", top: 14, right: 14,
          width: 34, height: 34, borderRadius: 10,
          background: `${color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={color} />
        </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 4 }}>
        {label}
      </div>

      <div style={{
        fontSize: 26, fontWeight: 800, color: "var(--text-primary)",
        marginTop: 10, lineHeight: 1, letterSpacing: "-0.5px",
      }}>
        {value ?? "—"}
      </div>

      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.4 }}>
          {sub}
        </div>
      )}

      {source && (
        <div style={{
          marginTop: 10, paddingTop: 8,
          borderTop: "1px dashed var(--border)",
          fontSize: 10, color: "var(--text-muted)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{
            display: "inline-block", width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
            background: source.confidence === "high" ? "#16a34a" : source.confidence === "medium" ? "#d97706" : "#dc2626",
          }} />
          {source.file}
        </div>
      )}
    </div>
  );
}
