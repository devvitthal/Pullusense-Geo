import { useEffect, useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { sensorApi } from "../api/sensorApi";
import { getAQILevel, formatCreatedAt } from "../utils/aqi";
import AQIBadge from "../components/AQIBadge";
import type { SensorReading } from "../types";
import type { RefreshContext } from "../App";
import "leaflet/dist/leaflet.css";

/** Default center (Pune, India) when no nodes have GPS. */
const DEFAULT_CENTER: [number, number] = [18.5204, 73.8567];
const DEFAULT_ZOOM = 12;

export default function MapView() {
  const navigate = useNavigate();
  const { onRefreshRef, onRefreshingChange, onLastRefreshChange } =
    useOutletContext<RefreshContext>();

  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    onRefreshingChange(true);
    setError(null);
    try {
      const data = await sensorApi.getAllLatest();
      setReadings(data);
      onLastRefreshChange(new Date());
    } catch {
      setError("Unable to reach the API.");
    } finally {
      setLoading(false);
      onRefreshingChange(false);
    }
  }, [onRefreshingChange, onLastRefreshChange]);

  useEffect(() => {
    onRefreshRef(fetchData);
    fetchData();
    const id = setInterval(fetchData, 15_000);
    return () => clearInterval(id);
  }, [fetchData, onRefreshRef]);

  const geoNodes = readings.filter(
    (r) => r.latitude != null && r.longitude != null,
  );

  const center: [number, number] =
    geoNodes.length > 0
      ? [
          geoNodes.reduce((s, r) => s + r.latitude!, 0) / geoNodes.length,
          geoNodes.reduce((s, r) => s + r.longitude!, 0) / geoNodes.length,
        ]
      : DEFAULT_CENTER;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="panel p-6 text-center max-w-sm">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 px-4 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Stats bar */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-white">Sensor Map</h1>
          <span className="text-xs text-slate-500">
            {geoNodes.length} of {readings.length} nodes with GPS
          </span>
        </div>
        {readings.length > 0 && geoNodes.length === 0 && (
          <span className="text-xs text-amber-400">
            No nodes have GPS coordinates yet
          </span>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          className="absolute inset-0 z-0"
          style={{ background: "#0b1120" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {geoNodes.map((reading) => {
            const level = getAQILevel(reading.aqi);
            return (
              <CircleMarker
                key={reading.nodeId}
                center={[reading.latitude!, reading.longitude!]}
                radius={14}
                pathOptions={{
                  color: level.color,
                  fillColor: level.color,
                  fillOpacity: 0.35,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="min-w-48 text-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">
                        {reading.nodeId}
                      </span>
                      <AQIBadge aqi={reading.aqi} size="sm" />
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-2">
                      <div>
                        <span className="text-slate-500">AQI</span>
                        <p
                          className="font-semibold"
                          style={{ color: level.color }}
                        >
                          {reading.aqi}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Temp</span>
                        <p className="font-semibold text-slate-800">
                          {reading.temperature.toFixed(1)} °C
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Humidity</span>
                        <p className="font-semibold text-slate-800">
                          {reading.humidity.toFixed(1)} %
                        </p>
                      </div>
                      {reading.locationName && (
                        <div>
                          <span className="text-slate-500">Location</span>
                          <p className="font-semibold text-slate-800 truncate">
                            {reading.locationName}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* AQI bar */}
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((reading.aqi / 500) * 100, 100)}%`,
                          background: level.color,
                        }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {formatCreatedAt(reading.createdAt)}
                      </span>
                      <button
                        onClick={() => navigate(`/node/${reading.nodeId}`)}
                        className="text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        View History →
                      </button>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-4 right-4 z-[1000] glass-strong p-3 rounded-lg">
          <p className="text-xs font-semibold text-white mb-2">AQI Legend</p>
          <div className="space-y-1">
            {[
              { label: "Good (0–50)", color: "#22c55e" },
              { label: "Moderate (51–100)", color: "#eab308" },
              { label: "Sensitive (101–150)", color: "#f97316" },
              { label: "Unhealthy (151–200)", color: "#ef4444" },
              { label: "Very Unhealthy (201–300)", color: "#a855f7" },
              { label: "Hazardous (301+)", color: "#be123c" },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
