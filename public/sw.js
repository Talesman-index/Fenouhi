// FENOUHI — Service Worker
// Strategy:
//   - Static assets (JS, CSS, fonts, images): Cache First
//   - API / dynamic pages:                    Network First → fallback to cache
//   - Offline fallback page for navigation

const CACHE_VERSION = "v3-fenouhi-new-icons";
const STATIC_CACHE = `fenouhi-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fenouhi-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/favicon.svg",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-maskable-192x192.png",
  "/icons/icon-maskable-512x512.png",
  "/icons/apple-touch-icon.png",
];

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests, chrome extensions, supabase, and Next.js dev HMR
  if (
    request.method !== "GET" ||
    url.protocol === "chrome-extension:" ||
    url.hostname.includes("supabase") ||
    url.pathname.includes("webpack-hmr") ||
    url.pathname.includes("_next/static/webpack/") ||
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1"
  ) {
    return;
  }

  // Static assets → Cache First
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff|woff2|ttf|ico|css)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation (HTML pages) → Network First, fallback /offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigate(request));
    return;
  }

  // Everything else → Network First
  event.respondWith(networkFirst(request));
});

// ─── Strategies ──────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Asset unavailable offline", { status: 503 });
  }
}

async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline page
    const offlinePage = await caches.match("/offline");
    return (
      offlinePage ||
      new Response(
        `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Hors ligne — Fenouhi</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0F172A;color:#fff;text-align:center"><div><h1>📦 Vous êtes hors ligne</h1><p>Reconnectez-vous pour accéder à Fenouhi.</p></div></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      )
    );
  }
}

// ─── Push notifications (future-ready) ───────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Fenouhi", {
    body: data.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-96x96.png",
    data: { url: data.url || "/" },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ─── Message event listener ──────────────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

