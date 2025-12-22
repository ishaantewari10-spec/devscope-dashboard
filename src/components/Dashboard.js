import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import { metrics, performanceTrend } from "../data/metrics";

function Dashboard() {
  return (
    <div>
      <h2 className="dashboard-title">Performance Overview</h2>

      <div className="cards">
        {metrics.map((item) => (
          <MetricCard
            key={item.id}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>

      <h2 style={{ marginTop: "32px" }}>Performance Trend</h2>
      <PerformanceChart data={performanceTrend} />
    </div>
  );
}

export default Dashboard;
