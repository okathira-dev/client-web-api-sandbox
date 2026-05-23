import type { ModemId, TransferResult } from "../modems/types";

const DB_NAME = "audio-tone-lab-results";
const STORE_NAME = "results";
const DB_VERSION = 2;

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  runner: (store: IDBObjectStore) => IDBRequest<T>,
) {
  return new Promise<T>((resolve, reject) => {
    openDatabase()
      .then((db) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = runner(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => reject(transaction.error);
      })
      .catch(reject);
  });
}

interface StoredResult {
  id: string;
  result: TransferResult;
}

export async function saveResult(result: TransferResult) {
  const id = `${result.modemId}-${result.startedAt}`;
  const persisted: TransferResult = {
    ...result,
    decodedText: result.decodedText
      ? result.decodedText.slice(0, 512)
      : undefined,
    decodedFile: undefined,
  };
  await withStore("readwrite", (store) =>
    store.put({
      id,
      result: persisted,
    } satisfies StoredResult),
  );
}

type LegacyTransferResult = TransferResult & { algorithmId?: string };

function normalizeStoredResult(raw: TransferResult): TransferResult {
  if (raw.modemId) return raw;
  const legacy = raw as LegacyTransferResult;
  const fallbackId = legacy.algorithmId
    ? (`legacy:${legacy.algorithmId}` as ModemId)
    : ("legacy:unknown" as ModemId);
  return { ...raw, modemId: fallbackId };
}

export async function loadResults() {
  const all = (await withStore("readonly", (store) =>
    store.getAll(),
  )) as StoredResult[];
  return all
    .map((item) => normalizeStoredResult(item.result))
    .sort((a, b) => b.startedAt - a.startedAt);
}

export async function clearResults() {
  await withStore("readwrite", (store) => store.clear());
}
