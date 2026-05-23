const CACHE = "workout-v1";
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

// Fetch — network first, fall back to cache
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
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
