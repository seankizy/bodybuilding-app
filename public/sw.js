const CACHE = "workout-v6";
const ASSETS = ["/", "/index.html"];

// Install — cache core assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, cache only when offline.
// Page loads are fetched as a fresh, plain request (re-wrapping a navigate request with
// options can throw on some engines, which used to drop straight to the copy of
// index.html cached at install, i.e. an old build). Each good page load refreshes that
// cached copy, so the offline fallback is the latest build too.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(new Request(req.url, { cache: "no-store", credentials: "same-origin" }));
        if (fresh && fresh.ok) {
          const copy = fresh.clone();
          caches.open(CACHE).then(c => c.put("/index.html", copy)).catch(() => {});
        }
        return fresh;
      } catch {
        return (await caches.match("/index.html")) || (await caches.match("/")) || Response.error();
      }
    })());
    return;
  }
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});

// Timer notification — triggered from the app via postMessage
self.addEventListener("message", e => {
  if (e.data?.type === "TIMER_DONE") {
    self.registration.showNotification("Rest Over!", {
      body: e.data.exercise
        ? `Time to hit your next set of ${e.data.exercise}`
        : "Time for your next set 💪",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [200, 100, 200],
      tag: "rest-timer",
      renotify: true,
      requireInteraction: false,
    });
  }
});
