import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

function HistoryChart({ data }) {
    // Format the data for the chart (extracting just the time)
    const formattedData = data.map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })).reverse();

    return (
        <div className="chart-container history-chart">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="score"
                        name="Performance Score"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="fps"
                        name="FPS"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="loadTime"
                        name="Load Time (s)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default HistoryChart;
