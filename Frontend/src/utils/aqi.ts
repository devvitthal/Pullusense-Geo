import type { AQILevel } from "../types";

export const AQI_LEVELS: AQILevel[] = [
  {
    range: [0, 50],
    label: "Good",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    glow: "rgba(34,197,94,0.3)",
  },
  {
    range: [51, 100],
    label: "Moderate",
    color: "#eab308",
    bg: "rgba(234,179,8,0.15)",
    glow: "rgba(234,179,8,0.3)",
  },
  {
    range: [101, 150],
    label: "Unhealthy for Sensitive",
    color: "#f97316",
    bg: "rgba(249,115,22,0.15)",
    glow: "rgba(249,115,22,0.3)",
  },
  {
    range: [151, 200],
    label: "Unhealthy",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    glow: "rgba(239,68,68,0.3)",
  },
  {
    range: [201, 300],
    label: "Very Unhealthy",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
    glow: "rgba(168,85,247,0.3)",
  },
  {
    range: [301, 500],
    label: "Hazardous",
    color: "#be123c",
    bg: "rgba(190,18,60,0.15)",
    glow: "rgba(190,18,60,0.3)",
  },
];

export function getAQILevel(aqi: number): AQILevel {
  return (
    AQI_LEVELS.find((l) => aqi >= l.range[0] && aqi <= l.range[1]) ??
    AQI_LEVELS[AQI_LEVELS.length - 1]
  );
}

export function formatTimestamp(ts: number): string {
  if (!ts) return "—";
  const ms = ts > 1e10 ? ts : ts * 1000;
  return new Date(ms).toLocaleString();
}

export function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString();
}
