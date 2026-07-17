// @ts-nocheck -- This standalone file executes in ServiceWorkerGlobalScope, while
// the repository TypeScript project intentionally targets the Window DOM library.
const workerUrl = new URL(self.location.href);
const developmentMode = workerUrl.searchParams.get("mode") === "development";
const cachePrefix = "busybox-";
const cacheVersion = "v2";
const shellCacheName = `${cachePrefix}shell-${cacheVersion}`;
const assetCacheName = `${cachePrefix}assets-${cacheVersion}`;
const scopeUrl = new URL(self.registration.scope);
const shellUrl = new URL("./index.html", scopeUrl).href;
const assetPath = new URL("../assets/", scopeUrl).pathname;
const shellFiles = ["./index.html", "./manifest.webmanifest", "./icon.svg"];
const mutableShellUrls = new Set(
  shellFiles.map((path) => new URL(path, scopeUrl).href),
);
const immutableAssetPattern =
  /\/[A-Za-z0-9_.-]+-[A-Za-z0-9_-]{6,}\.(?:css|js|json|wasm)$/;

function isImmutableBuildAsset(url) {
  return (
    url.origin === self.location.origin &&
    url.pathname.startsWith(assetPath) &&
    immutableAssetPattern.test(url.pathname)
  );
}

function canStore(response) {
  return response.ok && response.type !== "opaque";
}

async function networkFirst(request, cacheName, fallbackUrl = request.url) {
  try {
    const response = await fetch(request);
    if (canStore(response)) {
      const cache = await caches.open(cacheName);
      await cache.put(fallbackUrl, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(fallbackUrl);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(assetCacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (canStore(response)) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function precacheProductionShell() {
  const shellCache = await caches.open(shellCacheName);
  await shellCache.addAll(shellFiles);

  // Vite writes content-hashed entry scripts, modulepreloads, and styles into
  // index.html. Discovering them at install time keeps the first offline reload
  // usable without coupling this static worker to a particular build hash.
  const shellResponse = await shellCache.match(shellUrl);
  if (!shellResponse) throw new Error("Busybox shell was not cached");
  const html = await shellResponse.text();
  const references = Array.from(
    html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g),
    (match) => new URL(match[1], shellUrl),
  );
  const entryAssets = [
    ...new Set(
      references
        .filter((url) => isImmutableBuildAsset(url))
        .map((url) => url.href),
    ),
  ];
  const assetCache = await caches.open(assetCacheName);
  if (entryAssets.length > 0) await assetCache.addAll(entryAssets);
}

self.addEventListener("install", (event) => {
  if (developmentMode) {
    // The development worker exists for notification/PWA stage APIs, but it must
    // replace an old cache-first worker immediately and never precache Vite source.
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(precacheProductionShell());
});

self.addEventListener("activate", (event) => {
  const currentCaches = new Set([shellCacheName, assetCacheName]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(cachePrefix) &&
                (developmentMode || !currentCaches.has(key)),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Vite still needs a worker for notification flows during development. Leaving
  // fetch unhandled makes every module/HMR request use the network normally.
  if (developmentMode) return;

  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isBusyboxNavigation =
    request.mode === "navigate" &&
    (url.pathname === scopeUrl.pathname ||
      url.pathname === new URL("./index.html", scopeUrl).pathname);
  if (isBusyboxNavigation) {
    // HTML is mutable: prefer the deployed version, then fall back to the one
    // canonical shell response. Query-string stage routes share that fallback.
    event.respondWith(networkFirst(request, shellCacheName, shellUrl));
    return;
  }

  if (mutableShellUrls.has(url.href)) {
    event.respondWith(networkFirst(request, shellCacheName));
    return;
  }

  if (isImmutableBuildAsset(url)) {
    // Vite content-hashed assets are immutable, so cache-first is safe and lets
    // previously loaded lazy stage chunks work offline.
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    "./index.html?stage=S-090&notification=1",
    self.registration.scope,
  ).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) =>
          client.url.startsWith(self.registration.scope),
        );
        if (existing) return existing.navigate(target).then(() => existing.focus());
        return self.clients.openWindow(target);
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") void self.skipWaiting();
});
