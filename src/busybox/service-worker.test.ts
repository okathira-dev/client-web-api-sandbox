import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

type WorkerEventHandler = (event: Record<string, unknown>) => void;

const workerSource = readFileSync(
  new URL("../public/busybox/service-worker.js", import.meta.url),
  "utf8",
);

function createWorker(scriptUrl: string) {
  const listeners = new Map<string, WorkerEventHandler>();
  const shellHtml = `
    <script type="module" src="../assets/busybox-AbCdEf12.js"></script>
    <link rel="modulepreload" href="../assets/client-ZyXwVu98.js">
    <link rel="stylesheet" href="../assets/busybox-QwErTy76.css">
    <link rel="manifest" href="./manifest.webmanifest">
  `;
  const shellCache = {
    addAll: jest.fn(async () => undefined),
    match: jest.fn(async () => new Response(shellHtml)),
    put: jest.fn(async () => undefined),
  };
  const assetCache = {
    addAll: jest.fn(async () => undefined),
    match: jest.fn(async () => undefined),
    put: jest.fn(async () => undefined),
  };
  const caches = {
    open: jest.fn(async (name: string) =>
      name.includes("shell") ? shellCache : assetCache,
    ),
    keys: jest.fn(async () => ["busybox-shell-v1"]),
    delete: jest.fn(async () => true),
  };
  const skipWaiting = jest.fn(async () => undefined);
  const claim = jest.fn(async () => undefined);
  const fetcher = jest.fn(async () => new Response("network"));
  const self = {
    location: new URL(scriptUrl),
    registration: { scope: "https://example.test/repo/busybox/" },
    clients: {
      claim,
      matchAll: jest.fn(async () => []),
      openWindow: jest.fn(async () => undefined),
    },
    skipWaiting,
    addEventListener: (type: string, handler: WorkerEventHandler) => {
      listeners.set(type, handler);
    },
  };

  runInNewContext(workerSource, {
    Array,
    Error,
    Promise,
    Response,
    Set,
    URL,
    caches,
    fetch: fetcher,
    self,
  });

  return {
    assetCache,
    caches,
    fetcher,
    listeners,
    shellCache,
    skipWaiting,
  };
}

describe("Busybox service worker strategy", () => {
  it("leaves every fetch on the network in development mode", () => {
    const worker = createWorker(
      "https://example.test/repo/busybox/service-worker.js?mode=development",
    );
    const respondWith = jest.fn();

    worker.listeners.get("fetch")?.({
      request: {
        method: "GET",
        mode: "cors",
        url: "https://example.test/repo/busybox/main.tsx",
      },
      respondWith,
    });

    expect(respondWith).not.toHaveBeenCalled();
  });

  it("activates the development worker immediately without precaching", async () => {
    const worker = createWorker(
      "https://example.test/repo/busybox/service-worker.js?mode=development",
    );
    let installation: Promise<unknown> | undefined;

    worker.listeners.get("install")?.({
      waitUntil: (promise: Promise<unknown>) => {
        installation = promise;
      },
    });
    await installation;

    expect(worker.skipWaiting).toHaveBeenCalledTimes(1);
    expect(worker.caches.open).not.toHaveBeenCalled();
  });

  it("precaches only the production shell and its hashed entry assets", async () => {
    const worker = createWorker(
      "https://example.test/repo/busybox/service-worker.js",
    );
    let installation: Promise<unknown> | undefined;

    worker.listeners.get("install")?.({
      waitUntil: (promise: Promise<unknown>) => {
        installation = promise;
      },
    });
    await installation;

    expect(worker.shellCache.addAll).toHaveBeenCalledWith([
      "./index.html",
      "./manifest.webmanifest",
      "./icon.svg",
    ]);
    expect(worker.assetCache.addAll).toHaveBeenCalledWith([
      "https://example.test/repo/assets/busybox-AbCdEf12.js",
      "https://example.test/repo/assets/client-ZyXwVu98.js",
      "https://example.test/repo/assets/busybox-QwErTy76.css",
    ]);
  });

  it("handles mutable navigation and hashed assets but ignores Vite source", () => {
    const worker = createWorker(
      "https://example.test/repo/busybox/service-worker.js",
    );
    const navigationResponse = jest.fn();
    const assetResponse = jest.fn();
    const sourceResponse = jest.fn();
    const fetchHandler = worker.listeners.get("fetch");

    fetchHandler?.({
      request: {
        method: "GET",
        mode: "navigate",
        url: "https://example.test/repo/busybox/index.html?stage=S-070",
      },
      respondWith: navigationResponse,
    });
    fetchHandler?.({
      request: {
        method: "GET",
        mode: "cors",
        url: "https://example.test/repo/assets/coreStages-AbCdEf12.js",
      },
      respondWith: assetResponse,
    });
    fetchHandler?.({
      request: {
        method: "GET",
        mode: "cors",
        url: "https://example.test/repo/busybox/stages/coreStages.tsx",
      },
      respondWith: sourceResponse,
    });

    expect(navigationResponse).toHaveBeenCalledTimes(1);
    expect(assetResponse).toHaveBeenCalledTimes(1);
    expect(sourceResponse).not.toHaveBeenCalled();
  });
});
