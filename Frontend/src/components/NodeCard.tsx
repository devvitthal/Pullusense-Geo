import type { SensorReading } from "../types";
import { getAQILevel, formatCreatedAt } from "../utils/aqi";
import AQIBadge from "./AQIBadge";

interface NodeCardProps {
  reading: SensorReading;
  onClick: () => void;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-600 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-300 tabular-nums">{value}</p>
    </div>
  );
}

export default function NodeCard({ reading, onClick }: NodeCardProps) {
  const level = getAQILevel(reading.aqi);

  return (
    <button
      onClick={onClick}
      className="card card-interactive p-5 text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-0.5">
            Node
          </p>
          <p className="text-sm font-bold text-white">{reading.nodeId}</p>
        </div>
        <AQIBadge aqi={reading.aqi} size="sm" />
      </div>

      {/* AQI value + bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-slate-600">Air Quality Index</span>
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: level.color }}
          >
            {reading.aqi}
          </span>
        </div>
        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((reading.aqi / 500) * 100, 100)}%`,
              background: level.color,
            }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        <Metric
          label="Temperature"
          value={`${reading.temperature.toFixed(1)} °C`}
        />
        <Metric label="Humidity" value={`${reading.humidity.toFixed(1)} %`} />
        {reading.latitude != null && reading.longitude != null ? (
          <>
            <Metric label="Latitude" value={reading.latitude.toFixed(4)} />
            <Metric label="Longitude" value={reading.longitude.toFixed(4)} />
          </>
        ) : (
          <div className="col-span-2">
            <Metric label="Location" value="No GPS data" />
          </div>
        )}
        {reading.locationName && (
          <div className="col-span-2">
            <Metric label="Location" value={reading.locationName} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600">
          {formatCreatedAt(reading.createdAt)}
        </span>
        <span className="text-xs text-indigo-500 flex items-center gap-0.5">
          History
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}
