import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";

const Ctx = createContext(null);

const init = {
  data:            null,
  loading:         true,
  error:           null,
  activeSection:   "overview",
  rightPanel:      "insights",
  sidebarOpen:     true,
  rightPanelOpen:  true,
  insights:        [],
  insightMetrics:  [],
  insightsLoading: false,
  chatHistory:     [],
  chatLoading:     false,
  filters:         { dateFrom: "", dateTo: "", party: "" },
};

function reducer(state, action) {
  switch (action.type) {
    case "DATA_OK":          return { ...state, data: action.payload, loading: false, error: null };
    case "DATA_ERR":         return { ...state, loading: false, error: action.payload };
    case "SET_SECTION":      return { ...state, activeSection: action.payload };
    case "SET_PANEL":        return { ...state, rightPanel: action.payload };
    case "TOGGLE_SIDEBAR":   return { ...state, sidebarOpen: !state.sidebarOpen };
    case "TOGGLE_RIGHT":     return { ...state, rightPanelOpen: !state.rightPanelOpen };
    case "SET_FILTER":       return { ...state, filters: { ...state.filters, ...action.payload } };
    case "RESET_FILTERS":    return { ...state, filters: { dateFrom: "", dateTo: "", party: "" } };
    case "INSIGHTS_START":   return { ...state, insightsLoading: true };
    case "INSIGHTS_OK":      return { ...state, insightsLoading: false,
        insights: action.payload.insights, insightMetrics: action.payload.metrics };
    case "CHAT_ADD":         return { ...state, chatHistory: [...state.chatHistory, action.payload] };
    case "CHAT_START":       return { ...state, chatLoading: true };
    case "CHAT_DONE":        return { ...state, chatLoading: false };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, init);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch("/api/data");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      dispatch({ type: "DATA_OK", payload: await r.json() });
    } catch (e) {
      dispatch({ type: "DATA_ERR", payload: e.message });
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    dispatch({ type: "INSIGHTS_START" });
    try {
      const r = await fetch("/api/insights", { method: "POST" });
      const j = await r.json();
      dispatch({ type: "INSIGHTS_OK", payload: j });
    } catch {
      dispatch({ type: "INSIGHTS_OK", payload: { insights: [], metrics: [] } });
    }
  }, []);

  const sendChat = useCallback(async (message) => {
    dispatch({ type: "CHAT_ADD", payload: { role: "user", content: message } });
    dispatch({ type: "CHAT_START" });
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: state.chatHistory }),
      });
      const j = await r.json();
      dispatch({ type: "CHAT_ADD", payload: { role: "assistant", content: j.reply } });
    } catch (e) {
      dispatch({ type: "CHAT_ADD", payload: { role: "assistant", content: `Error: ${e.message}` } });
    } finally {
      dispatch({ type: "CHAT_DONE" });
    }
  }, [state.chatHistory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Ctx.Provider value={{ ...state, dispatch, fetchData, fetchInsights, sendChat }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
