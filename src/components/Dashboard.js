import { useEffect, useState, useRef } from "react";
import MetricCard from "./MetricCard";
import PerformanceChart from "./PerformanceChart";

function Dashboard() {
  // ================= STATE =================
  const [pageLoadTime, setPageLoadTime] = useState(0);
  const [renders, setRenders] = useState(0);
  const [userEvents, setUserEvents] = useState(0);
  const [fps, setFps] = useState(0);
  const [score, setScore] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // ================= REFS =================
  const frameCount = useRef(0);
  const lastFrameTime = useRef(performance.now());

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
    </div>
  );
}

export default Dashboard;
