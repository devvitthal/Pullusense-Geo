// Service Worker for Web Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || "Air quality alert from PolluSense Geo",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      vibrate: [200, 100, 200],
      tag: "pollusense-alert",
      renotify: true,
      data: { url: data.url || "/dashboard" },
    };
    event.waitUntil(self.registration.showNotification(data.title || "PolluSense Alert", options));
  } catch {
    // Fallback for plain text payload
    const options = {
      body: event.data.text(),
      icon: "/favicon.ico",
      tag: "pollusense-alert",
    };
    event.waitUntil(self.registration.showNotification("PolluSense Alert", options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
