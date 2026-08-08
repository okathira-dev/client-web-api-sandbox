/**
 * レポートの永続化。
 *
 * 実行中の結果はメモリ上にだけ持ち、ここへ書くのは complete / cancelled / failed の
 * 終端状態に達したときだけ（仕様 5.2）。1,406 件ぶんのレポートを候補ごとに書き戻すと
 * シリアライズだけでメインスレッドが詰まるため（現在は 1,406 単位）。
 */

import {
  REPORT_CHANNEL_NAME,
  REPORT_DB_NAME,
  REPORT_DB_VERSION,
  REPORT_RECORD_KEY,
  REPORT_STORE_NAME,
  REPORT_VERSION,
} from "../consts/inspection";
import type { InspectionReport } from "../domain/types";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(REPORT_DB_NAME, REPORT_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(REPORT_STORE_NAME)) {
        request.result.createObjectStore(REPORT_STORE_NAME);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("indexeddb-open-failed"));
    };
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  operate: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(REPORT_STORE_NAME, mode);
      const request = operate(transaction.objectStore(REPORT_STORE_NAME));
      let settled = false;
      const finish = (settle: () => void) => {
        // request の error の後に transaction の abort も来るため、最初の原因だけを返す。
        if (settled) return;
        settled = true;
        settle();
      };
      request.onsuccess = () => {
        // request の成功はトランザクションの確定ではない。oncomplete まで待つ。
      };
      request.onerror = () => {
        finish(() => {
          reject(request.error ?? new Error("indexeddb-request-failed"));
        });
      };
      transaction.oncomplete = () => {
        finish(() => {
          resolve(request.result);
        });
      };
      transaction.onerror = () => {
        finish(() => {
          reject(
            transaction.error ?? new Error("indexeddb-transaction-failed"),
          );
        });
      };
      transaction.onabort = () => {
        finish(() => {
          reject(
            transaction.error ?? new Error("indexeddb-transaction-aborted"),
          );
        });
      };
    });
  } finally {
    database.close();
  }
};

/**
 * 保存済みレポートを読む。版が違うものは、結果の意味が変わっている可能性があるので捨てる。
 */
export const loadReport = async (): Promise<InspectionReport | null> => {
  try {
    const stored = await withStore<InspectionReport | undefined>(
      "readonly",
      (store) => store.get(REPORT_RECORD_KEY),
    );
    if (!stored || stored.version !== REPORT_VERSION) return null;
    return stored;
  } catch {
    return null;
  }
};

export const saveReport = async (report: InspectionReport): Promise<void> => {
  await withStore("readwrite", (store) => store.put(report, REPORT_RECORD_KEY));
  notifyReportChanged();
};

export const clearReport = async (): Promise<void> => {
  await withStore("readwrite", (store) => store.delete(REPORT_RECORD_KEY));
  notifyReportChanged();
};

/**
 * 他タブへの通知。レポート本体は載せず「変わった」ことだけ伝え、
 * 受け取った側が IndexedDB から読み直す。大きな構造体を複製しないため。
 */
const getChannel = (): BroadcastChannel | null => {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(REPORT_CHANNEL_NAME);
};

const notifyReportChanged = (): void => {
  const channel = getChannel();
  if (!channel) return;
  channel.postMessage("changed");
  channel.close();
};

export const subscribeReportChanged = (listener: () => void): (() => void) => {
  const channel = getChannel();
  if (!channel) return () => {};
  const handleMessage = () => {
    listener();
  };
  channel.addEventListener("message", handleMessage);
  return () => {
    channel.removeEventListener("message", handleMessage);
    channel.close();
  };
};
