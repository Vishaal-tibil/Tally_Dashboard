import React, { useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { useApp } from "../../context/AppContext";
import InsightBullet     from "./InsightBullet";
import InsightMetricCard from "./InsightMetricCard";

const s = {
  panel:   { padding: "16px", display: "flex", flexDirection: "column", gap: 16 },
  header:  { display: "flex", alignItems: "center", justifyContent: "space-between" },
  title:   { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" },
  btn:     { display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--accent-blue)", cursor: "pointer" },
  cards:   { display: "flex", gap: 8, flexWrap: "wrap" },
  bullets: {},
  empty:   { fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" },
  loading: { fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" },
};

export default function AiInsightsPanel() {
  const { insights, insightMetrics, insightsLoading, fetchInsights, data } = useApp();

  useEffect(() => {
    if (data && !insights.length) fetchInsights();
  }, [data]);

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <div style={s.title}>
          <Sparkles size={14} color="var(--accent-blue)" />
          AI Insights
        </div>
        <button style={s.btn} onClick={fetchInsights} disabled={insightsLoading}>
          <RefreshCw size={11} />
          {insightsLoading ? "Thinking…" : "Refresh"}
        </button>
      </div>

      {insightsLoading && <div style={s.loading}>Analysing Tally data…</div>}

      {!insightsLoading && !insights.length && (
        <div style={s.empty}>
          Click Refresh to generate insights.<br />
          <span style={{ fontSize: 11 }}>Requires MISTRAL_API_KEY in .env</span>
        </div>
      )}

      {insightMetrics.length > 0 && (
        <div style={s.cards}>
          {insightMetrics.map((m, i) => (
            <InsightMetricCard key={i} {...m} />
          ))}
        </div>
      )}

      {insights.length > 0 && (
        <div style={s.bullets}>
          {insights.map((t, i) => <InsightBullet key={i} text={t} />)}
        </div>
      )}
    </div>
  );
}
