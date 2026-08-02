import { reportFixture } from "../domain/__fixtures__/results";
import { saveReport } from "./reportStore";

type StoreHarness = {
  readonly close: jest.Mock;
  readonly openRequest: IDBOpenDBRequest;
  readonly request: IDBRequest<IDBValidKey>;
  readonly transaction: IDBTransaction;
};

const createStoreHarness = (): StoreHarness => {
  const request = {
    result: "latest",
    error: null,
    onsuccess: null,
    onerror: null,
  } as unknown as IDBRequest<IDBValidKey>;
  const transaction = {
    error: null,
    onabort: null,
    oncomplete: null,
    onerror: null,
    objectStore: () =>
      ({
        put: () => request,
      }) as unknown as IDBObjectStore,
  } as unknown as IDBTransaction;
  const close = jest.fn();
  const database = {
    close,
    transaction: () => transaction,
  } as unknown as IDBDatabase;
  const openRequest = {
    result: database,
    error: null,
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
  } as unknown as IDBOpenDBRequest;

  Object.defineProperty(globalThis, "indexedDB", {
    configurable: true,
    value: { open: () => openRequest } as unknown as IDBFactory,
  });
  Object.defineProperty(globalThis, "BroadcastChannel", {
    configurable: true,
    value: undefined,
  });

  return { close, openRequest, request, transaction };
};

const dispatch = (target: object, eventName: string): void => {
  const handler = (target as Record<string, unknown>)[eventName];
  if (typeof handler === "function") handler(new Event(eventName));
};

describe("saveReport", () => {
  const indexedDbDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "indexedDB",
  );
  const broadcastChannelDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "BroadcastChannel",
  );

  afterEach(() => {
    if (indexedDbDescriptor) {
      Object.defineProperty(globalThis, "indexedDB", indexedDbDescriptor);
    } else {
      delete (globalThis as { indexedDB?: IDBFactory }).indexedDB;
    }
    if (broadcastChannelDescriptor) {
      Object.defineProperty(
        globalThis,
        "BroadcastChannel",
        broadcastChannelDescriptor,
      );
    } else {
      delete (globalThis as { BroadcastChannel?: typeof BroadcastChannel })
        .BroadcastChannel;
    }
  });

  it("waits for transaction completion before resolving and closing the database", async () => {
    const harness = createStoreHarness();
    const saving = saveReport(reportFixture());
    dispatch(harness.openRequest, "onsuccess");
    await Promise.resolve();
    dispatch(harness.request, "onsuccess");

    let settled = false;
    void saving.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    expect(harness.close).not.toHaveBeenCalled();

    dispatch(harness.transaction, "oncomplete");
    await expect(saving).resolves.toBeUndefined();
    expect(harness.close).toHaveBeenCalledTimes(1);
  });

  it("rejects when a transaction aborts after the request succeeds", async () => {
    const harness = createStoreHarness();
    const saving = saveReport(reportFixture());
    dispatch(harness.openRequest, "onsuccess");
    await Promise.resolve();
    dispatch(harness.request, "onsuccess");
    dispatch(harness.transaction, "onabort");

    await expect(saving).rejects.toThrow("indexeddb-transaction-aborted");
    expect(harness.close).toHaveBeenCalledTimes(1);
  });
});
