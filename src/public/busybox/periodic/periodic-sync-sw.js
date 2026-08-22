// @ts-nocheck
const DATABASE = "busybox-periodic-stage-v1";
const STORE = "care";
const TAG = "busybox-greenhouse-v1";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE))
        request.result.createObjectStore(STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("database open failed"));
  });
}

async function readState(database) {
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get("state");
    request.onsuccess = () =>
      resolve(request.result ?? { key: "state", phase: 0, events: 0, clientlessEvents: 0 });
    request.onerror = () => reject(request.error ?? new Error("state read failed"));
  });
}

async function writeState(database, state) {
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put(state);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error ?? new Error("state write failed"));
  });
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag !== TAG) return;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      if (windows.length !== 0) return;
      const database = await openDatabase();
      const state = await readState(database);
      const expected = state.phase === 0 ? "water" : state.phase === 1 ? "light" : undefined;
      const canGrow = expected && state.pendingCare === expected;
      const nextPhase = canGrow ? state.phase + 1 : state.phase;
      if (canGrow) {
        const asset = nextPhase === 1 ? "sprout.svg" : "bloom.svg";
        const cache = await caches.open(`busybox-s740-phase-${nextPhase}`);
        await cache.add(new URL(asset, self.location.href));
      }
      await writeState(database, {
        ...state,
        phase: nextPhase,
        pendingCare: canGrow ? undefined : state.pendingCare,
        events: state.events + 1,
        clientlessEvents: state.clientlessEvents + 1,
      });
      database.close();
    })(),
  );
});
