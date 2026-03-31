import api from "./axiosConfig";

export interface PushSubscriptionPayload {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export const pushApi = {
  subscribe: (payload: PushSubscriptionPayload) =>
    api.post("/push/subscribe", payload).then((r) => r.data),

  unsubscribe: (payload: PushSubscriptionPayload) =>
    api.post("/push/unsubscribe", payload).then((r) => r.data),
};
