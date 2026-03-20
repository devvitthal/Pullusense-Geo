export interface SensorReading {
  id: number;
  nodeId: string;
  aqi: number;
  temperature: number;
  humidity: number;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  timestamp: number;
  createdAt: string;
}

export interface AQILevel {
  label: string;
  color: string;
  bg: string;
  glow: string;
  range: [number, number];
}

export type ViewMode = "dashboard" | "history";

export interface AppRoute {
  view: ViewMode;
  nodeId?: string;
}
