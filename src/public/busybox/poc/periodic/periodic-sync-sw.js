// @ts-nocheck
const DB_NAME = "busybox-periodic-poc";
const STORE = "care";
const TAG = "busybox-care";
const ASSET_URL = "../../fixtures/media/assets/reel-320x180.webm";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== TAG) return;
  event.waitUntil((async () => {
    const database = await openDatabase();
    const state = await new Promise((resolve, reject) => {
      const request = database.transaction(STORE).objectStore(STORE).get("state");
      request.onsuccess = () => resolve(request.result?.value ?? { phase: 0, care: [], events: 0 });
      request.onerror = () => reject(request.error ?? new Error("state read failed"));
    });
    const nextPhase = state.phase + (state.care.length > state.phase ? 1 : 0);
    if (nextPhase > state.phase) {
      const cache = await caches.open(`busybox-periodic-phase-${nextPhase}`);
      await cache.add(new URL(ASSET_URL, self.location.href));
    }
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put({
        key: "state",
        phase: nextPhase,
        care: state.care,
        events: state.events + 1,
        lastTag: event.tag,
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("state write failed"));
    });
    database.close();
  })());
});
