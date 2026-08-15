// ==============================================================================
// SERVICE WORKER FOR PWA & BACKGROUND NOTIFICATIONS
// ==============================================================================

const CACHE_NAME = "tuition-app-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./class7.html",
  "./class8.html",
  "./class9.html",
  "./class10.html",
  "./style.css",
  "./app.js",
  "./admin.js",
  "./firebase-init.js",
  "./firebase-config.mjs",
  "./manifest.json",
  "./logo.png"
];

// 1. Install Event: Cache critical static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

// 4. Push Event: Show push notifications on mobile screen
self.addEventListener("push", (event) => {
  let data = { title: "New Notification!", body: "Check the Tuition Portal for updates." };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "https://cdn-icons-png.flaticon.com/512/2997/2997322.png",
    badge: "https://cdn-icons-png.flaticon.com/512/2997/2997322.png",
    vibrate: [200, 100, 200],
    data: {
      url: "./index.html"
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Notification Click Event: Open app when user clicks the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("index.html") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("./index.html");
      }
    })
  );
});
