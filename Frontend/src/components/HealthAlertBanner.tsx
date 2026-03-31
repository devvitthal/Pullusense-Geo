import { useState, useEffect } from "react";
import { sensorApi } from "../api/sensorApi";
import type { HealthAlert } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  MapPin,
  X,
  Sparkles,
  Wind,
  Heart,
  Lightbulb,
} from "lucide-react";

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: "warn" | "ok" }> = {
  GOOD:                { color: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/20", icon: "ok" },
  MODERATE:            { color: "text-yellow-400",  bg: "bg-yellow-500/8",   border: "border-yellow-500/20",  icon: "warn" },
  UNHEALTHY_SENSITIVE: { color: "text-orange-400",  bg: "bg-orange-500/8",   border: "border-orange-500/20",  icon: "warn" },
  UNHEALTHY:           { color: "text-red-400",     bg: "bg-red-500/8",      border: "border-red-500/20",     icon: "warn" },
  VERY_UNHEALTHY:      { color: "text-purple-400",  bg: "bg-purple-500/8",   border: "border-purple-500/20",  icon: "warn" },
  HAZARDOUS:           { color: "text-rose-400",    bg: "bg-rose-500/8",     border: "border-rose-500/20",    icon: "warn" },
  UNKNOWN:             { color: "text-slate-400",   bg: "bg-slate-500/8",    border: "border-slate-500/20",   icon: "ok" },
};

export default function HealthAlertBanner() {
  const [alert, setAlert] = useState<HealthAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [geoError, setGeoError] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      setGeoError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await sensorApi.getHealthAlert(pos.coords.latitude, pos.coords.longitude);
          setAlert(data);
        } catch {
          // silently fail — alert banner just won't show
        } finally {
          setLoading(false);
        }
      },
      () => {
        setGeoError(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (loading || dismissed || geoError || !alert) return null;

  const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.UNKNOWN;
  const isGood = alert.severity === "GOOD" && !alert.temperatureAlert;

  return (
    <div className={`panel p-0 overflow-hidden border ${cfg.border} relative`}>
      {/* Top accent line */}
      <div className={`h-0.5 w-full ${cfg.bg}`} style={{ opacity: 0.6 }} />

      <div className="p-4 sm:p-5 space-y-3">
        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
              {cfg.icon === "ok" ? (
                <ShieldCheck className={`w-4.5 h-4.5 ${cfg.color}`} />
              ) : (
                <ShieldAlert className={`w-4.5 h-4.5 ${cfg.color}`} />
              )}
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${cfg.color}`}>
                {isGood ? "Air Quality is Good" : "Health Advisory"}
              </h3>
              <div className="flex items-center gap-3 mt-0.5">
                {alert.locationName && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {alert.locationName}
                  </span>
                )}
                <span className="text-xs text-slate-600">
                  {alert.distanceKm > 0 && `${alert.distanceKm} km away`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/40 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stats pills ── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
            AQI {alert.aqi}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
            alert.temperatureAlert
              ? "bg-orange-500/8 text-orange-400 border border-orange-500/20"
              : "bg-slate-500/8 text-slate-400 border border-slate-700/40"
          }`}>
            <Thermometer className="w-3 h-3" />
            {alert.temperature.toFixed(1)}°C
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-slate-500 bg-slate-500/6 border border-slate-700/30">
            Node {alert.nodeId}
          </span>
        </div>

        {/* ── Summary ── */}
        {alert.summary && (
          <div className={`px-3 py-2.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
            <p className={`text-xs font-medium ${cfg.color} leading-relaxed`}>
              {alert.summary}
            </p>
          </div>
        )}

        {/* ── Advisory sections grid ── */}
        <div className="grid sm:grid-cols-2 gap-2.5">
          {/* AQI Advice */}
          {alert.aqiAdvice && (
            <AdvisoryCard
              icon={<Wind className="w-3.5 h-3.5" />}
              label="Air Quality"
              text={alert.aqiAdvice}
              iconColor="text-cyan-400"
            />
          )}

          {/* Temperature Advice */}
          {alert.tempAdvice && (
            <AdvisoryCard
              icon={<Thermometer className="w-3.5 h-3.5" />}
              label="Temperature"
              text={alert.tempAdvice}
              iconColor={alert.temperatureAlert ? "text-orange-400" : "text-blue-400"}
            />
          )}

          {/* Sensitive Groups */}
          {alert.sensitiveGroups && (
            <AdvisoryCard
              icon={<Heart className="w-3.5 h-3.5" />}
              label="Sensitive Groups"
              text={alert.sensitiveGroups}
              iconColor="text-pink-400"
            />
          )}

          {/* Action Tip */}
          {alert.actionTip && (
            <AdvisoryCard
              icon={<Lightbulb className="w-3.5 h-3.5" />}
              label="What To Do Now"
              text={alert.actionTip}
              iconColor="text-amber-400"
            />
          )}
        </div>

        {/* ── Powered by badge ── */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] text-slate-600">Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
}

function AdvisoryCard({
  icon,
  label,
  text,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
  iconColor: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={iconColor}>{icon}</span>
        <span className={`text-xs font-medium ${iconColor}`}>{label}</span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
    </div>
  );
}
