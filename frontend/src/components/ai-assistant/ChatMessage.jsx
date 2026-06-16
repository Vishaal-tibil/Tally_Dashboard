import React from "react";
import { User, Bot } from "lucide-react";

const s = {
  wrap: (role) => ({
    display: "flex", gap: 8,
    flexDirection: role === "user" ? "row-reverse" : "row",
    alignItems: "flex-start", padding: "6px 0",
  }),
  icon: (role) => ({
    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: role === "user" ? "var(--accent-blue)" : "var(--bg-card)",
    border: role === "assistant" ? "1px solid var(--border-light)" : "none",
  }),
  bubble: (role) => ({
    maxWidth: "82%", padding: "8px 12px", borderRadius: 10, fontSize: 12,
    lineHeight: 1.6, color: "var(--text-primary)",
    background: role === "user" ? "var(--accent-blue)" : "var(--bg-card)",
    borderBottomRightRadius: role === "user"      ? 2 : 10,
    borderBottomLeftRadius:  role === "assistant" ? 2 : 10,
  }),
};

export default function ChatMessage({ role, content }) {
  return (
    <div style={s.wrap(role)}>
      <div style={s.icon(role)}>
        {role === "user" ? <User size={13} color="#fff" /> : <Bot size={13} color="var(--accent-blue)" />}
      </div>
      <div style={s.bubble(role)}>{content}</div>
    </div>
  );
}
