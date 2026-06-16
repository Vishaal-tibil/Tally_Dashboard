import React from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { useApp } from "../../context/AppContext";
import AiInsightsPanel  from "../ai-insights/AiInsightsPanel";
import AiAssistantPanel from "../ai-assistant/AiAssistantPanel";

export default function RightPanel() {
  const { rightPanel, rightPanelOpen, dispatch } = useApp();

  if (!rightPanelOpen) return null;

  return (
    <div style={{
      width: "var(--right-panel-width)",
      minWidth: "var(--right-panel-width)",
      background: "var(--bg-secondary)",
      borderLeft: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        {[
          { id: "insights", label: "AI Insights", icon: Sparkles },
          { id: "chat",     label: "Chat",        icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => {
          const active = rightPanel === id;
          return (
            <button
              key={id}
              onClick={() => dispatch({ type: "SET_PANEL", payload: id })}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "12px 0", fontSize: 12, fontWeight: active ? 600 : 400,
                color:        active ? "var(--accent-blue)" : "var(--text-muted)",
                borderBottom: active ? "2px solid var(--accent-blue)" : "2px solid transparent",
                background: "transparent", transition: "all 0.12s",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {rightPanel === "insights" ? <AiInsightsPanel /> : <AiAssistantPanel />}
      </div>
    </div>
  );
}
