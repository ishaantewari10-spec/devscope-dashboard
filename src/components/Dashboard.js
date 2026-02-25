import { useEffect, useState, useRef } from "react";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";
import HistoryChart from "./HistoryChart";

function Dashboard() {
  // ================= STATE =================
  const [pageLoadTime, setPageLoadTime] = useState(0);
  const [renders, setRenders] = useState(0);
  const [userEvents, setUserEvents] = useState(0);
  const [fps, setFps] = useState(0);
  const [score, setScore] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);

  // ================= REFS =================
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());

  // ================= FETCH HISTORY =================
  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/metrics/history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); // Refresh history every minute
    return () => clearInterval(interval);
  }, []);

  // ================= PAGE LOAD (REAL) =================
  useEffect(() => {
    const timing = performance.timing;
    const load =
      timing.loadEventEnd - timing.navigationStart;

    if (load > 0) {
      setPageLoadTime((load / 1000).toFixed(2));
    }
  }, []);

  // ================= RENDER COUNT (SAFE) =================
  useEffect(() => {
    setRenders((r) => r + 1);
  }, []);

  // ================= USER EVENTS =================
  useEffect(() => {
    const handle = () => setUserEvents((u) => u + 1);

    window.addEventListener("click", handle);
    window.addEventListener("keydown", handle);

    return () => {
      window.removeEventListener("click", handle);
      window.removeEventListener("keydown", handle);
    };
  }, []);

  // ================= FPS =================
  useEffect(() => {
    let raf;

    const loop = () => {
      frameCount.current += 1;
      const now = performance.now();

      if (now - lastFrameTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastFrameTime.current = now;
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ================= PERFORMANCE SCORE =================
  useEffect(() => {
    const calculated =
      100 -
      pageLoadTime * 10 -
      renders * 0.5 -
      Math.max(0, 60 - fps);

    setScore(Math.max(0, Math.round(calculated)));
  }, [pageLoadTime, renders, fps]);

  // ================= CHART DATA =================
  const chartData = [
    { title: "Load", value: pageLoadTime },
    { title: "Renders", value: renders },
    { title: "Events", value: userEvents },
    { title: "FPS", value: fps },
    { title: "Score", value: score }
  ];

  // ================= DATA SYNC =================
  useEffect(() => {
    const syncMetrics = async () => {
      if (score === 0) return; // Wait for initial calculations

      try {
        await fetch('http://localhost:5000/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            loadTime: parseFloat(pageLoadTime),
            renders,
            userEvents,
            fps,
            score
          }),
        });
        console.log('Metrics synced to backend');
      } catch (err) {
        console.error('Sync failed:', err);
      }
    };

    const interval = setInterval(syncMetrics, 30000); // Sync every 30s
    return () => clearInterval(interval);
  }, [pageLoadTime, renders, userEvents, fps, score]);

  // ================= UI =================
  return (
    <div className={`dashboard ${darkMode ? "dark" : ""}`}>
      {/* Dark Mode Toggle */}
      <button
        className="dark-toggle"
        onClick={() => setDarkMode((d) => !d)}
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <h1>DevScope Dashboard</h1>
      <h2>Live Performance Overview</h2>

      <div className="metrics-grid">
        <MetricCard title="Page Load (s)" value={pageLoadTime} />
        <MetricCard title="Renders" value={renders} />
        <MetricCard title="User Events" value={userEvents} />
        <MetricCard title="FPS" value={fps} />
        <MetricCard title="Score" value={score} />
      </div>

      <PerformanceChart data={chartData} />

      {/* Historical Data Section */}
      <h2 style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>Historical Performance Trends</h2>
      <div className="history-container">
        {history.length > 0 ? (
          <HistoryChart data={history} />
        ) : (
          <div className="no-history">
            <p style={{ opacity: 0.7 }}>No historical data available yet.</p>
            <p style={{ fontSize: '0.9rem' }}>Data is automatically synced to MongoDB every 30 seconds.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
