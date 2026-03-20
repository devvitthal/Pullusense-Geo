import axios from "axios";
import type { SensorReading } from "../types";

const BASE = "/api/sensor-data";

const client = axios.create({ baseURL: BASE, timeout: 8000 });

export const sensorApi = {
  /** POST – ingest a reading (primarily for testing via the UI) */
  ingest: (payload: Omit<SensorReading, "id" | "createdAt">) =>
    client.post<SensorReading>("", payload).then((r) => r.data),

  /** GET /latest – latest reading for every node */
  getAllLatest: () =>
    client.get<SensorReading[]>("/latest").then((r) => r.data),

  /** GET /latest/:nodeId – most recent reading for one node */
  getLatestByNode: (nodeId: string) =>
    client.get<SensorReading>(`/latest/${nodeId}`).then((r) => r.data),

  /** GET /history/:nodeId – full history for one node */
  getHistoryByNode: (nodeId: string) =>
    client.get<SensorReading[]>(`/history/${nodeId}`).then((r) => r.data),
};
