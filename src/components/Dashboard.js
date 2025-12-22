import { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import { initialMetrics } from "../data/metrics";

function Dashboard() {
  const [metrics, setMetrics] = useState(initialMetrics);

  useEffect(() => {
    const interval = setInterval(() => {
         console.log("Updating metrics...");
      setMetrics((prevMetrics) =>
        prevMetrics.map((metric) => {
          let randomChange = Math.random();

          if (metric.title === "Page Load Time") {
            randomChange = (Math.random() * 0.5 - 0.25);
          } else {
            randomChange = Math.floor(Math.random() * 5);
          }

          return {
            ...metric,
            value: Math.max(0, +(metric.value + randomChange).toFixed(2))
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="dashboard-title">Performance Overview</h2>

      <div className="cards">
        {metrics.map((item) => (
          <MetricCard
            key={item.id}
            title={item.title}
            value={`${item.value}${item.unit}`}
          />
        ))}
      </div>

      <h2 style={{ marginTop: "32px" }}>Performance Trend</h2>
      <PerformanceChart data={metrics.map((m) => m.value)} />
    </div>
  );
}

export default Dashboard;
