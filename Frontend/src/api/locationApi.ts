import api from "./axiosConfig";
import type { SavedLocation } from "../types";

export interface CreateLocationRequest {
  label: string;
  latitude: number;
  longitude: number;
  alertsEnabled?: boolean;
}

export const locationApi = {
  getAll: () => api.get<SavedLocation[]>("/locations").then((r) => r.data),

  create: (req: CreateLocationRequest) =>
    api.post<SavedLocation>("/locations", req).then((r) => r.data),

  update: (id: number, req: CreateLocationRequest) =>
    api.put<SavedLocation>(`/locations/${id}`, req).then((r) => r.data),

  toggleAlerts: (id: number) =>
    api
      .patch<SavedLocation>(`/locations/${id}/toggle-alerts`)
      .then((r) => r.data),

  remove: (id: number) => api.delete(`/locations/${id}`),
};
