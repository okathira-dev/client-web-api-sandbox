export const S740_DATABASE = "busybox-periodic-stage-v1";
export const S740_STORE = "care";
export const S740_TAG = "busybox-greenhouse-v1";

export interface S740State {
  key: "state";
  phase: 0 | 1 | 2;
  pendingCare?: "water" | "light";
  events: number;
  clientlessEvents: number;
}

export const initialS740State: S740State = {
  key: "state",
  phase: 0,
  events: 0,
  clientlessEvents: 0,
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(S740_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(S740_STORE))
        request.result.createObjectStore(S740_STORE, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("S-740 IndexedDB open failed"));
  });
}

export async function readS740State(): Promise<S740State> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database
      .transaction(S740_STORE)
      .objectStore(S740_STORE)
      .get("state");
    request.onsuccess = () => {
      database.close();
      resolve(request.result ?? initialS740State);
    };
    request.onerror = () => {
      database.close();
      reject(request.error ?? new Error("S-740 state read failed"));
    };
  });
}

export async function writeS740Care(
  care: "water" | "light",
): Promise<S740State> {
  const database = await openDatabase();
  const current = await new Promise<S740State>((resolve, reject) => {
    const request = database
      .transaction(S740_STORE)
      .objectStore(S740_STORE)
      .get("state");
    request.onsuccess = () => resolve(request.result ?? initialS740State);
    request.onerror = () =>
      reject(request.error ?? new Error("S-740 state read failed"));
  });
  const expected = current.phase === 0 ? "water" : "light";
  if (current.phase >= 2 || care !== expected || current.pendingCare) {
    database.close();
    return current;
  }
  const next: S740State = { ...current, pendingCare: care };
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(S740_STORE, "readwrite");
    transaction.objectStore(S740_STORE).put(next);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("S-740 state write failed"));
  });
  database.close();
  return next;
}

export async function deleteS740State(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(S740_DATABASE);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("S-740 state delete failed"));
    request.onblocked = () =>
      reject(new Error("S-740 state delete was blocked"));
  });
}
