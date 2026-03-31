import { useEffect, useState } from "react";
import { locationApi } from "../api/locationApi";
import { sensorApi } from "../api/sensorApi";
import type { SavedLocation, HealthAlert } from "../types";
import type { CreateLocationRequest } from "../api/locationApi";

export default function SavedLocations() {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [alerts, setAlerts] = useState<Record<number, HealthAlert | null>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateLocationRequest>({
    label: "",
    latitude: 0,
    longitude: 0,
    alertsEnabled: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const data = await locationApi.getAll();
      setLocations(data);
      // Fetch health alerts for each location
      const alertMap: Record<number, HealthAlert | null> = {};
      await Promise.all(
        data.map(async (loc) => {
          try {
            const alert = await sensorApi.getHealthAlert(loc.latitude, loc.longitude);
            alertMap[loc.id] = alert;
          } catch {
            alertMap[loc.id] = null;
          }
        }),
      );
      setAlerts(alertMap);
    } catch {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
        }));
      },
      () => setError("Unable to get current location."),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editId) {
        await locationApi.update(editId, form);
      } else {
        await locationApi.create(form);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ label: "", latitude: 0, longitude: 0, alertsEnabled: true });
      await fetchLocations();
    } catch {
      setError("Failed to save location.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (loc: SavedLocation) => {
    setForm({
      label: loc.label,
      latitude: loc.latitude,
      longitude: loc.longitude,
      alertsEnabled: loc.alertsEnabled,
    });
    setEditId(loc.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await locationApi.remove(id);
      await fetchLocations();
    } catch {
      setError("Failed to delete location.");
    }
  };

  const handleToggleAlerts = async (id: number) => {
    try {
      await locationApi.toggleAlerts(id);
      await fetchLocations();
    } catch {
      setError("Failed to toggle alerts.");
    }
  };

  const severityColor = (severity: string) => {
    switch (severity) {
      case "GOOD":
        return "#22c55e";
      case "MODERATE":
        return "#eab308";
      case "UNHEALTHY_SENSITIVE":
        return "#f97316";
      case "UNHEALTHY":
        return "#ef4444";
      case "VERY_UNHEALTHY":
        return "#a855f7";
      case "HAZARDOUS":
        return "#be123c";
      default:
        return "#64748b";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">My Locations</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Save locations to receive AQI alerts via email & push notifications
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ label: "", latitude: 0, longitude: 0, alertsEnabled: true });
          }}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-sm shadow-indigo-600/25"
        >
          + Add Location
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">
            {editId ? "Edit Location" : "Add New Location"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Home, Office, School"
                maxLength={50}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, latitude: parseFloat(e.target.value) || 0 }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, longitude: parseFloat(e.target.value) || 0 }))
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              📍 Use my current location
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="alertsEnabled"
                checked={form.alertsEnabled}
                onChange={(e) =>
                  setForm((f) => ({ ...f, alertsEnabled: e.target.checked }))
                }
                className="rounded border-slate-700 bg-slate-800"
              />
              <label htmlFor="alertsEnabled" className="text-xs text-slate-400">
                Enable AQI alerts for this location
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving…" : editId ? "Update" : "Save Location"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Location Cards */}
      {locations.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-500 text-sm">No saved locations yet.</p>
          <p className="text-slate-600 text-xs mt-1">
            Add your home, office, or other places to monitor air quality.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {locations.map((loc) => {
            const alert = alerts[loc.id];
            const color = alert ? severityColor(alert.severity) : "#64748b";
            return (
              <div key={loc.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                    >
                      {loc.label.toLowerCase().includes("home")
                        ? "🏠"
                        : loc.label.toLowerCase().includes("office")
                          ? "🏢"
                          : loc.label.toLowerCase().includes("school")
                            ? "🏫"
                            : "📍"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{loc.label}</h3>
                      <p className="text-xs text-slate-500">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAlerts(loc.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        loc.alertsEnabled
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800/60 text-slate-500 border border-slate-700/40"
                      }`}
                    >
                      {loc.alertsEnabled ? "🔔 Alerts On" : "🔕 Alerts Off"}
                    </button>
                    <button
                      onClick={() => handleEdit(loc)}
                      className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="px-2.5 py-1 rounded-md text-xs text-red-400 hover:text-red-300 bg-red-500/8 hover:bg-red-500/15 border border-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Health Alert Card */}
                {alert && alert.severity !== "UNKNOWN" ? (
                  <div
                    className="rounded-lg p-4 mt-2"
                    style={{
                      background: `${color}10`,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{
                          color,
                          background: `${color}20`,
                          border: `1px solid ${color}35`,
                        }}
                      >
                        {alert.severity.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {alert.distanceKm.toFixed(1)} km away — Node {alert.nodeId}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <span className="text-xs text-slate-500">AQI</span>
                        <p className="text-sm font-bold" style={{ color }}>
                          {alert.aqi}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Temperature</span>
                        <p className="text-sm font-bold text-white">
                          {alert.temperature.toFixed(1)} °C
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Node</span>
                        <p className="text-sm font-bold text-white">{alert.nodeId}</p>
                      </div>
                    </div>
                    {alert.summary && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {alert.summary}
                      </p>
                    )}
                    {alert.actionTip && (
                      <p className="text-xs text-slate-300 mt-2 font-medium">
                        💡 {alert.actionTip}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg p-3 mt-2 bg-slate-800/40 border border-slate-700/30">
                    <p className="text-xs text-slate-500">
                      No nearby sensor data available for this location.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
