import { useState, useEffect, useCallback } from "react";
import type { SensorReading } from "../types";
import { sensorApi } from "../api/sensorApi";
import { getAQILevel } from "../utils/aqi";
import AQIBadge from "../components/AQIBadge";
import HistoryChart from "../components/HistoryChart";
import HistoryTable from "../components/HistoryTable";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

interface NodeHistoryProps {
  nodeId: string;
  onRefreshRef: (fn: () => void) => void;
  onRefreshingChange: (v: boolean) => void;
  onLastRefreshChange: (d: Date) => void;
}

export default function NodeHistory({
  nodeId,
  onRefreshRef,
  onRefreshingChange,
  onLastRefreshChange,
}: NodeHistoryProps) {
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    onRefreshingChange(true);
    setError(null);
    try {
      const data = await sensorApi.getHistoryByNode(nodeId);
      setHistory(data);
      onLastRefreshChange(new Date());
    } catch (e: unknown) {
      const msg =
        (e as { response?: { status?: number } })?.response?.status === 404
          ? `No data found for node "${nodeId}".`
          : "Failed to load history. Check your connection.";
      setError(msg);
    } finally {
      setLoading(false);
      onRefreshingChange(false);
    }
  }, [nodeId, onRefreshingChange, onLastRefreshChange]);

  useEffect(() => {
    onRefreshRef(fetchData);
    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => clearInterval(id);
  }, [fetchData, onRefreshRef]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-32">
        <Spinner size={36} />
        <p className="text-slate-500 text-sm">Loading history for {nodeId}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-32">
        <div className="panel p-8 max-w-md w-full mx-4 text-center">
          <p className="text-sm font-semibold text-slate-300 mb-1.5">Error</p>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  const latest = history[0];
  const aqiLevel = latest ? getAQILevel(latest.aqi) : null;

  const aqiValues = history.map((r) => r.aqi);
  const avgAqi = Math.round(
    aqiValues.reduce((s, v) => s + v, 0) / aqiValues.length,
  );
  const maxAqi = Math.max(...aqiValues);
  const minAqi = Math.min(...aqiValues);
  const avgHumidity = (
    history.reduce((s, r) => s + r.humidity, 0) / history.length
  ).toFixed(1);

  return (
    <div className="flex-1 px-5 py-5 space-y-5 max-w-screen-xl mx-auto w-full">
      {/* Node banner */}
      {latest && aqiLevel && (
        <div className="panel px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">
              Node ID
            </p>
            <p className="text-lg font-bold text-white">{latest.nodeId}</p>
          </div>
          <div className="w-px h-8 bg-slate-800 hidden sm:block" />
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">
              Current AQI
            </p>
            <div className="flex items-center gap-2.5">
              <span
                className="text-3xl font-bold tabular-nums leading-none"
                style={{ color: aqiLevel.color }}
              >
                {latest.aqi}
              </span>
              <AQIBadge aqi={latest.aqi} size="lg" />
            </div>
          </div>
          {(latest.latitude != null && latest.longitude != null) ||
          latest.locationName ? (
            <>
              <div className="w-px h-8 bg-slate-800 hidden sm:block" />
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">
                  Location
                </p>
                {latest.locationName && (
                  <p className="text-sm font-medium text-slate-300">
                    {latest.locationName}
                  </p>
                )}
                {latest.latitude != null && latest.longitude != null && (
                  <p className="text-xs font-mono text-slate-500">
                    {latest.latitude.toFixed(5)}, {latest.longitude.toFixed(5)}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          label="Total Readings"
          value={history.length}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          }
          accentColor="#6366f1"
        />
        <StatCard
          label="Avg AQI"
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          accentColor={getAQILevel(avgAqi).color}
        />
        <StatCard
          label="Max AQI"
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
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          accentColor={getAQILevel(maxAqi).color}
        />
        <StatCard
          label="Min AQI"
          value={minAqi}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          }
          accentColor={getAQILevel(minAqi).color}
        />
        <StatCard
          label="Avg Humidity"
          value={avgHumidity}
          unit="%"
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          }
          accentColor="#38bdf8"
        />
      </div>

      {/* Chart */}
      {history.length >= 2 && <HistoryChart data={history} />}

      {/* Table with built-in pagination */}
      <HistoryTable data={history} />
    </div>
  );
}
