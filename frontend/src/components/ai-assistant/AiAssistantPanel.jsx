import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal } from "lucide-react";
import { useApp } from "../../context/AppContext";
import ChatMessage from "./ChatMessage";

const STARTERS = [
  "What are my top customers by revenue?",
  "Which bills are overdue by 90+ days?",
  "How much GST is payable this period?",
  "What is my current cash position?",
];

const s = {
  wrap:   { display: "flex", flexDirection: "column", height: "100%" },
  msgs:   { flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2 },
  starters: { padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 },
  startTitle: { fontSize: 11, color: "var(--text-muted)", marginBottom: 4 },
  chip: {
    padding: "7px 12px", borderRadius: 8, fontSize: 11,
    background: "var(--bg-card)", border: "1px solid var(--border-light)",
    color: "var(--text-secondary)", cursor: "pointer", textAlign: "left",
    lineHeight: 1.4,
  },
  inputRow: {
    display: "flex", gap: 8, padding: "12px 16px",
    borderTop: "1px solid var(--border)", flexShrink: 0,
  },
  input: {
    flex: 1, background: "var(--bg-card)", border: "1px solid var(--border-light)",
    borderRadius: 8, padding: "8px 12px", color: "var(--text-primary)",
    fontSize: 12, outline: "none", resize: "none",
  },
  send: {
    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "var(--accent-blue)", color: "#fff",
  },
};

export default function AiAssistantPanel() {
  const { chatHistory, chatLoading, sendChat } = useApp();
  const [msg, setMsg]   = useState("");
  const bottomRef       = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const send = (text) => {
    const t = (text ?? msg).trim();
    if (!t || chatLoading) return;
    sendChat(t);
    setMsg("");
  };

  return (
    <div style={s.wrap}>
      <div style={s.msgs}>
        {chatHistory.length === 0 && (
          <div style={s.starters}>
            <div style={s.startTitle}>Suggested questions</div>
            {STARTERS.map((q) => (
              <button key={q} style={s.chip} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
        )}
        {chatHistory.map((m, i) => <ChatMessage key={i} role={m.role} content={m.content} />)}
        {chatLoading && <ChatMessage role="assistant" content="Thinking…" />}
        <div ref={bottomRef} />
      </div>

      <div style={s.inputRow}>
        <textarea
          style={s.input}
          rows={2}
          placeholder="Ask about your Tally data…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button style={s.send} onClick={() => send()} disabled={chatLoading}>
          <SendHorizontal size={15} />
        </button>
      </div>
    </div>
  );
}
