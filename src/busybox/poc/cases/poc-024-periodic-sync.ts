import type { PocRoot } from "../contracts";

type PeriodicSyncManagerLike = {
  register: (tag: string, options?: { minInterval?: number }) => Promise<void>;
  unregister: (tag: string) => Promise<void>;
  getTags: () => Promise<string[]>;
};
type CareRegistration = ServiceWorkerRegistration & {
  periodicSync?: PeriodicSyncManagerLike;
};

const DB_NAME = "busybox-periodic-poc";
const STORE = "care";
const TAG = "busybox-care";
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE, { keyPath: "key" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

async function readState(): Promise<{
  phase: number;
  care: string[];
  events: number;
}> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE).objectStore(STORE).get("state");
    request.onsuccess = () =>
      resolve(request.result?.value ?? { phase: 0, care: [], events: 0 });
    request.onerror = () =>
      reject(request.error ?? new Error("state read failed"));
  });
}

async function writeCare(kind: "water" | "light"): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    const read = store.get("state");
    read.onsuccess = () => {
      const state = read.result?.value ?? { phase: 0, care: [], events: 0 };
      const care = new Set<string>(state.care);
      care.add(kind);
      store.put({
        ...state,
        key: "state",
        care: [...care],
        lastCare: kind,
        lastCareAt: Date.now(),
      });
    };
    read.onerror = () => reject(read.error ?? new Error("care read failed"));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("care write failed"));
  });
}

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const register = root.querySelector<HTMLButtonElement>(
    "[data-periodic-register]",
  );
  const water = root.querySelector<HTMLButtonElement>("[data-periodic-water]");
  const light = root.querySelector<HTMLButtonElement>("[data-periodic-light]");
  const read = root.querySelector<HTMLButtonElement>("[data-periodic-read]");
  const unregister = root.querySelector<HTMLButtonElement>(
    "[data-periodic-unregister]",
  );
  let registration: CareRegistration | undefined;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const getRegistration = async () => {
    registration ??= (await navigator.serviceWorker.register(
      new URL("./periodic/periodic-sync-sw.js", location.href),
      {
        scope: new URL("./periodic/", location.href).pathname,
        type: "module",
      },
    )) as CareRegistration;
    return registration;
  };
  const registerPeriodic = async () => {
    try {
      const current = await getRegistration();
      if (!current.periodicSync) {
        render(
          "Periodic Background Syncを公開していません。timerへfallbackしません。",
        );
        root.dataset.pocState = "unsupported";
        return;
      }
      await current.periodicSync.register(TAG, {
        minInterval: 24 * 60 * 60 * 1000,
      });
      render(`periodicSync登録済み: tag=${TAG}。実scheduler eventを待ちます。`);
      root.dataset.pocState = "partial";
    } catch (error) {
      render(
        `periodicSync登録失敗: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const care = async (kind: "water" | "light") => {
    try {
      await writeCare(kind);
      render(`${kind} careを保存しました。page loadではphaseを進めません。`);
    } catch (error) {
      render(
        `care保存失敗: ${error instanceof Error ? error.message : "error"}`,
      );
    }
  };
  const inspect = async () => {
    const state = await readState();
    render(
      `phase=${state.phase}; care=${state.care.join(", ") || "none"}; actual periodic events=${state.events}`,
    );
    if (state.phase >= 2 && state.events >= 2) root.dataset.pocState = "pass";
  };
  const unregisterPeriodic = async () => {
    const current = await getRegistration();
    await current.periodicSync?.unregister(TAG);
    render(
      "periodicSync tagをunregisterしました。stateは明示resetまで保持します。",
    );
  };
  const onRegister = () => void registerPeriodic();
  const onWater = () => void care("water");
  const onLight = () => void care("light");
  const onRead = () => void inspect();
  const onUnregister = () => void unregisterPeriodic();
  register?.addEventListener("click", onRegister);
  water?.addEventListener("click", onWater);
  light?.addEventListener("click", onLight);
  read?.addEventListener("click", onRead);
  unregister?.addEventListener("click", onUnregister);
  return () => {
    register?.removeEventListener("click", onRegister);
    water?.removeEventListener("click", onWater);
    light?.removeEventListener("click", onLight);
    read?.removeEventListener("click", onRead);
    unregister?.removeEventListener("click", onUnregister);
  };
}
