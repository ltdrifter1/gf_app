/* Lumen PWA service worker — cache the shell; honor Web Push payload href. */
const CACHE = "lumen-shell-v2";
const PRECACHE = ["/", "/app/chat", "/logo.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
  );
});

self.addEventListener("push", (event) => {
  let title = "Lumen";
  let body = "You have a new ping.";
  let href = "/app/chat";
  try {
    if (event.data) {
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      href = data.href || href;
    }
  } catch {
    body = event.data ? event.data.text() : body;
  }
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      data: { href },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href || "/app/chat";
  const url = new URL(href, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          const maybeNav = client;
          if (typeof maybeNav.navigate === "function") {
            return maybeNav.navigate(url).then(() => client.focus());
          }
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
