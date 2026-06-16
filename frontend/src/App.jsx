import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar      from "./components/layout/Sidebar";
import TopBar       from "./components/layout/TopBar";
import FilterBar    from "./components/common/FilterBar";
import RightPanel   from "./components/layout/RightPanel";
import Overview     from "./pages/Overview";

const styles = {
  shell: {
    display: "flex", height: "100vh", width: "100vw", overflow: "hidden",
    background: "var(--bg-primary)",
  },
  main: {
    display: "flex", flexDirection: "column",
    flex: 1, overflow: "hidden",
  },
  body: {
    display: "flex", flex: 1, overflow: "hidden",
  },
  content: {
    flex: 1, overflowY: "auto",
    padding: "24px",
    background: "var(--bg-primary)",
  },
  loading: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", color: "var(--text-secondary)", fontSize: 16,
  },
  error: {
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", color: "var(--accent-red)", fontSize: 16,
  },
};

function Shell() {
  const { loading, error } = useApp();

  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.main}>
        <TopBar />
        {!loading && !error && <FilterBar />}
        <div style={styles.body}>
          <div style={styles.content}>
            {loading ? (
              <div style={styles.loading}>Loading Tally data…</div>
            ) : error ? (
              <div style={styles.error}>Error: {error}</div>
            ) : (
              <Overview />
            )}
          </div>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
