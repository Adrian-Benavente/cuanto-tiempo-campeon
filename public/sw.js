const CACHE_NAME = "cuanto-tiempo-campeon-__CACHE_VERSION__";
const CACHE_PREFIX = "cuanto-tiempo-campeon-";

function isNavigationRequest(request) {
  if (request.mode === "navigate") {
    return true;
  }

  const accept = request.headers.get("accept") ?? "";
  return request.method === "GET" && accept.includes("text/html");
}

function isHashedStaticAsset(pathname) {
  return pathname.startsWith("/static/");
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    if (response && response.status === 200 && response.type === "basic") {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const fallback = await caches.match("/index.html");
    if (fallback) {
      return fallback;
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response && response.status === 200 && response.type === "basic") {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ source: "offline" }), {
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  if (url.pathname === "/sw.js") {
    return;
  }

  if (isHashedStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (isNavigationRequest(event.request) || url.pathname === "/index.html") {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
