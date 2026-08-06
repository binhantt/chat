// No-op service worker: unregister self on install
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", () => {
  self.registration.unregister();
  clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    for (const client of clients) {
      client.navigate(client.url);
    }
  });
});
