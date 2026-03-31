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

export interface HealthAlert {
  severity: string;
  aqi: number;
  temperature: number;
  nodeId: string;
  locationName: string | null;
  distanceKm: number;
  temperatureAlert: string | null;
  summary: string;
  aqiAdvice: string;
  tempAdvice: string;
  sensitiveGroups: string;
  actionTip: string;
}
