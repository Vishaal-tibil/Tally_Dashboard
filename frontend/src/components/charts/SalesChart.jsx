import React from "react";
import { Bar } from "react-chartjs-2";
import { useFilteredData } from "../../hooks/useFilteredData";

const opts = {
  indexAxis: "y",
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const v = ctx.raw;
          return v >= 1e7 ? ` ₹${(v/1e7).toFixed(2)} Cr` : ` ₹${(v/1e5).toFixed(1)}L`;
        },
      },
    },
  },
  scales: {
    x: {
      title: { display: true, text: "Invoice Total (₹)", color: "#94a3b8", font: { size: 11 } },
      ticks: { color: "#64748b", font: { size: 11 } },
      grid:  { color: "#e2e8f0" },
    },
    y: {
      title: { display: true, text: "Customer / Party", color: "#94a3b8", font: { size: 11 } },
      ticks: { color: "#475569", font: { size: 12 } },
      grid:  { display: false },
    },
  },
};

export default function SalesChart() {
  const { salesByParty: parties } = useFilteredData();
  if (!parties?.length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No sales data</div>;
  return (
    <div style={{ height: Math.max(180, parties.length * 48 + 40) }}>
      <Bar
        data={{
          labels: parties.map((p) => p.party),
          datasets: [{
            data: parties.map((p) => p.total),
            backgroundColor: "rgba(59,130,246,0.75)",
            borderColor: "#3b82f6",
            borderWidth: 1,
            borderRadius: 4,
          }],
        }}
        options={opts}
      />
    </div>
  );
}
