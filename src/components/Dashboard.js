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
  const [scanUrl, setScanUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

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

  // ================= EXTERNAL SCAN =================
  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanUrl) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/metrics/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Scan failed. Please try again.');
        return;
      }

      setScanResult(data);
    } catch (err) {
      console.error('Scan failed:', err);
      alert('Failed to connect to the backend server. Make sure it is running on port 5000.');
    } finally {
      setIsScanning(false);
    }
  };

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

      {/* External Robot Scanner Section */}
      <div className="scanner-section" style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
        <h2>🤖 External Robot Scanner</h2>
        <p style={{ opacity: 0.7, marginBottom: '1.5rem' }}>
          Ask our backend robot to visit any website and measure its real-world performance.
        </p>

        <form onSubmit={handleScan} className="scanner-form" style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="url"
            placeholder="https://example.com"
            value={scanUrl}
            onChange={(e) => setScanUrl(e.target.value)}
            required
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: darkMode ? '#1e293b' : 'white',
              color: darkMode ? 'white' : 'black'
            }}
          />
          <button
            type="submit"
            disabled={isScanning}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: 'white',
              fontWeight: '600',
              cursor: isScanning ? 'not-allowed' : 'pointer',
              opacity: isScanning ? 0.7 : 1
            }}
          >
            {isScanning ? 'Scanning...' : 'Run Audit'}
          </button>
        </form>

        {scanResult && (
          <div className="scan-result-card" style={{
            padding: '20px',
            borderRadius: '12px',
            background: darkMode ? '#1e293b' : '#f0f4ff',
            border: '1px solid #4f46e5'
          }}>
            <h3 style={{ margin: '0 0 15px 0' }}>Audit Result for {scanResult.url}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Page Load Time</span>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: '5px 0' }}>{scanResult.loadTime}s</p>
              </div>
              <div>
                <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total Audit Duration</span>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', margin: '5px 0' }}>{scanResult.totalDuration}s</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '15px' }}>
              Finalized at: {new Date(scanResult.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

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
