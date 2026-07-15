import type { ProgressDocument } from "../domain/progress";

const databaseName = "busybox-progress";
const objectStoreName = "documents";
const progressKey = "current";

export interface ProgressStore {
  load(): Promise<unknown | null>;
  save(document: ProgressDocument): Promise<void>;
  clear(): Promise<void>;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), {
      once: true,
    });
    request.addEventListener("error", () => reject(request.error), {
      once: true,
    });
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error), {
      once: true,
    });
    transaction.addEventListener("error", () => reject(transaction.error), {
      once: true,
    });
  });
}

export class IndexedDbProgressStore implements ProgressStore {
  private databasePromise?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    if (!this.databasePromise) {
      this.databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);
        request.addEventListener(
          "upgradeneeded",
          () => {
            if (!request.result.objectStoreNames.contains(objectStoreName)) {
              request.result.createObjectStore(objectStoreName);
            }
          },
          { once: true },
        );
        request.addEventListener("success", () => resolve(request.result), {
          once: true,
        });
        request.addEventListener("error", () => reject(request.error), {
          once: true,
        });
        request.addEventListener(
          "blocked",
          () => reject(new Error("IndexedDB upgrade blocked")),
          {
            once: true,
          },
        );
      });
    }
    return this.databasePromise;
  }

  async load(): Promise<unknown | null> {
    const database = await this.open();
    const transaction = database.transaction(objectStoreName, "readonly");
    const value = await requestResult(
      transaction.objectStore(objectStoreName).get(progressKey),
    );
    await transactionDone(transaction);
    return value ?? null;
  }

  async save(document: ProgressDocument): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(objectStoreName, "readwrite");
    transaction.objectStore(objectStoreName).put(document, progressKey);
    await transactionDone(transaction);
  }

  async clear(): Promise<void> {
    const database = await this.open();
    const transaction = database.transaction(objectStoreName, "readwrite");
    transaction.objectStore(objectStoreName).delete(progressKey);
    await transactionDone(transaction);
  }
}
