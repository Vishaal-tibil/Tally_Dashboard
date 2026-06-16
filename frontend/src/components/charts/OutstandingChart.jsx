import React from "react";
import { Bar } from "react-chartjs-2";
import { useApp } from "../../context/AppContext";

const BUCKET_ORDER = ["0-30", "31-60", "61-90", "90+"];
const COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

const opts = {
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
      title: { display: true, text: "Ageing Bucket (days)", color: "#94a3b8", font: { size: 11 } },
      ticks: { color: "#475569", font: { size: 12 } },
      grid:  { display: false },
    },
    y: {
      title: { display: true, text: "Pending Amount (₹)", color: "#94a3b8", font: { size: 11 } },
      ticks: { color: "#64748b", font: { size: 11 } },
      grid:  { color: "#e2e8f0" },
    },
  },
};

export default function OutstandingChart() {
  const { data } = useApp();
  const buckets = data?.outstanding?.by_bucket ?? {};
  if (!Object.keys(buckets).length) return <div style={{ color: "var(--text-muted)", padding: 16 }}>No outstanding data</div>;

  const labels  = BUCKET_ORDER.filter((k) => buckets[k] != null);
  const values  = labels.map((k) => buckets[k]);
  const colors  = labels.map((k) => COLORS[BUCKET_ORDER.indexOf(k)]);

  return (
    <div style={{ height: 200 }}>
      <Bar
        data={{
          labels,
          datasets: [{
            label: "Ageing",
            data: values,
            backgroundColor: colors.map((c) => c + "bf"),
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 4,
          }],
        }}
        options={opts}
      />
    </div>
  );
}
