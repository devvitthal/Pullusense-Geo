import api from "./axiosConfig";
import type { SensorReading } from "../types";

export const sensorApi = {
  /** POST – ingest a reading (primarily for testing via the UI) */
  ingest: (payload: Omit<SensorReading, "id" | "createdAt">) =>
    api.post<SensorReading>("/sensor-data", payload).then((r) => r.data),

  /** GET /latest – latest reading for every node */
  getAllLatest: () =>
    api.get<SensorReading[]>("/sensor-data/latest").then((r) => r.data),

  /** GET /latest/:nodeId – most recent reading for one node */
  getLatestByNode: (nodeId: string) =>
    api.get<SensorReading>(`/sensor-data/latest/${nodeId}`).then((r) => r.data),

  /** GET /history/:nodeId – full history for one node */
  getHistoryByNode: (nodeId: string) =>
    api.get<SensorReading[]>(`/sensor-data/history/${nodeId}`).then((r) => r.data),
};
