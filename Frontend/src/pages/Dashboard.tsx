import { useState, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import type { SensorReading } from "../types";
import type { RefreshContext } from "../App";
import { sensorApi } from "../api/sensorApi";
import { getAQILevel } from "../utils/aqi";
import NodeCard from "../components/NodeCard";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";

const NODE_PAGE_SIZE = 12;

export default function Dashboard() {
  const navigate = useNavigate();
  const { onRefreshRef, onRefreshingChange, onLastRefreshChange } =
    useOutletContext<RefreshContext>();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodePage, setNodePage] = useState(1);

  const fetchData = useCallback(async () => {
    onRefreshingChange(true);
    setError(null);
    try {
      const data = await sensorApi.getAllLatest();
      setReadings(data);
      onLastRefreshChange(new Date());
    } catch {
      setError(
        "Unable to reach the API. Make sure the Spring Boot server is running on port 8080.",
      );
    } finally {
      setLoading(false);
      onRefreshingChange(false);
    }
  }, [onRefreshingChange, onLastRefreshChange]);

  useEffect(() => {
    onRefreshRef(fetchData);
    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [fetchData, onRefreshRef]);

  /* --- Summary stats --- */
  const nodeCount = readings.length;
  const avgAqi = nodeCount
    ? Math.round(readings.reduce((s, r) => s + r.aqi, 0) / nodeCount)
    : 0;
  const maxAqi = nodeCount ? Math.max(...readings.map((r) => r.aqi)) : 0;
  const avgTemp = nodeCount
    ? (readings.reduce((s, r) => s + r.temperature, 0) / nodeCount).toFixed(1)
    : "â€”";
  const maxLevel = getAQILevel(maxAqi);

  /* --- Node grid pagination --- */
  const totalNodePages = Math.max(1, Math.ceil(nodeCount / NODE_PAGE_SIZE));
  const safeNodePage = Math.min(nodePage, totalNodePages);
  const visibleReadings = readings.slice(
    (safeNodePage - 1) * NODE_PAGE_SIZE,
    safeNodePage * NODE_PAGE_SIZE,
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-32">
        <Spinner size={36} />
        <p className="text-slate-500 text-sm">Loading sensor dataâ€¦</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-32">
        <div className="panel p-8 max-w-md w-full mx-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-300 mb-1.5">
            Connection Error
          </p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (nodeCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-32">
        <div className="panel p-8 max-w-md w-full mx-4 text-center">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.92 2 2 0 0 1 3.6 2.73h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.86a16 16 0 0 0 6.16 6.16l.88-.88a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.62 17v-.08z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-300 mb-1.5">
            Awaiting Data
          </p>
          <p className="text-xs text-slate-500">
            No readings yet. Sensor nodes will appear here once they begin
            transmitting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 py-5 space-y-5 max-w-7xl mx-auto w-full">
      {/* Summary stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Active Nodes"
          value={nodeCount}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          }
          accentColor="#6366f1"
          sub="Reporting nodes"
        />
        <StatCard
          label="Average AQI"
          value={avgAqi}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          }
          accentColor={getAQILevel(avgAqi).color}
          sub={getAQILevel(avgAqi).label}
        />
        <StatCard
          label="Peak AQI"
          value={maxAqi}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          accentColor={maxLevel.color}
          sub={maxLevel.label}
        />
        <StatCard
          label="Avg Temperature"
          value={avgTemp}
          unit="Â°C"
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          }
          accentColor="#f97316"
          sub="Across all nodes"
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-300">Sensor Nodes</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Latest reading per node â€” click to view history
          </p>
        </div>
        <span className="text-xs text-slate-600 tabular-nums">
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Node grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {visibleReadings.map((reading) => (
          <NodeCard
            key={reading.nodeId}
            reading={reading}
            onClick={() => navigate(`/node/${reading.nodeId}`)}
          />
        ))}
      </div>

      {/* Node grid pagination */}
      {totalNodePages > 1 && (
        <Pagination
          page={safeNodePage}
          totalPages={totalNodePages}
          onPageChange={setNodePage}
          pageSize={NODE_PAGE_SIZE}
          totalItems={nodeCount}
        />
      )}

      {/* AQI legend */}
      <div className="panel px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mr-1">
          AQI Scale
        </span>
        {[
          { label: "Good", range: "0â€“50", color: "#22c55e" },
          { label: "Moderate", range: "51â€“100", color: "#eab308" },
          { label: "Unhealthy (S)", range: "101â€“150", color: "#f97316" },
          { label: "Unhealthy", range: "151â€“200", color: "#ef4444" },
          { label: "Very Unhealthy", range: "201â€“300", color: "#a855f7" },
          { label: "Hazardous", range: "301â€“500", color: "#be123c" },
        ].map((l) => (
          <span
            key={l.label}
            className="flex items-center gap-1.5 text-xs text-slate-400"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: l.color }}
            />
            {l.label}
            <span className="text-slate-700">{l.range}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
