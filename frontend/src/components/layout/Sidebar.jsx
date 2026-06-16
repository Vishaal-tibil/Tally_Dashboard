import React from "react";
import {
  LayoutDashboard, TrendingUp, ShoppingCart, Clock,
  Receipt, Landmark, Package, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const nav = [
  { id: "overview",    label: "Tally Dashboard", icon: LayoutDashboard },
  { id: "sales",       label: "Sales",       icon: TrendingUp       },
  { id: "purchases",   label: "Purchases",   icon: ShoppingCart     },
  { id: "outstanding", label: "Outstanding", icon: Clock            },
  { id: "gst",         label: "GST",         icon: Receipt          },
  { id: "cash-bank",   label: "Cash & Bank", icon: Landmark         },
  { id: "products",    label: "Products",    icon: Package          },
];

export default function Sidebar() {
  const { activeSection, sidebarOpen, dispatch, data } = useApp();

  const setSection = (id) => {
    dispatch({ type: "SET_SECTION", payload: id });
    if (id === "ai-insights") dispatch({ type: "SET_PANEL", payload: "insights" });
  };

  const w = sidebarOpen ? "var(--sidebar-width)" : "52px";

  return (
    <div style={{
      width: w, minWidth: w,
      background: "var(--bg-secondary)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      flexShrink: 0, userSelect: "none",
      transition: "width 0.2s ease, min-width 0.2s ease",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
    }}>
      {/* Header */}
      <div style={{
        padding: sidebarOpen ? "14px 12px 12px" : "14px 0 12px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        justifyContent: sidebarOpen ? "space-between" : "center",
        minHeight: 56,
      }}>
        {sidebarOpen && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-green)", flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>
                Ravi Super Market
              </span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, paddingLeft: 15, whiteSpace: "nowrap" }}>
              Tally ERP Dashboard
            </div>
          </div>
        )}
        <button
          onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })}
          style={{
            width: 24, height: 24, borderRadius: 5, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-primary)", color: "var(--text-muted)",
            border: "1px solid var(--border)",
          }}
          title={sidebarOpen ? "Collapse" : "Expand"}
        >
          {sidebarOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px 6px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ id, label, icon: Icon }) => {
          const active = activeSection === id;
          return (
            <div
              key={id}
              onClick={() => setSection(id)}
              title={!sidebarOpen ? label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: sidebarOpen ? 9 : 0,
                justifyContent: sidebarOpen ? "flex-start" : "center",
                padding: sidebarOpen ? "7px 8px 7px 6px" : "8px",
                borderRadius: 8, cursor: "pointer",
                background: active
                  ? "linear-gradient(90deg,#2563eb18 0%,#2563eb05 100%)"
                  : "transparent",
                color:      active ? "var(--accent-blue)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap", overflow: "hidden",
                borderLeft: active ? "3px solid var(--accent-blue)" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: active ? "#2563eb15" : "transparent",
                transition: "background 0.15s",
              }}>
                <Icon size={14} />
              </div>
              {sidebarOpen && <span>{label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {sidebarOpen && data?.summary?.last_sync && (
        <div style={{
          padding: "10px 12px",
          borderTop: "1px solid var(--border)",
          fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap",
        }}>
          Synced {data.summary.last_sync}
        </div>
      )}
    </div>
  );
}
