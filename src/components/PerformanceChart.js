import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function PerformanceChart({ data }) {
  const chartData = {
    labels: ["Init", "Load", "Render", "Interact", "Idle"],
    datasets: [
      {
        label: "Load Time (seconds)",
        data: data,
        borderColor: "#4f46e5",
        tension: 0.4
      }
    ]
  };

  return <Line data={chartData} />;
}

export default PerformanceChart;
