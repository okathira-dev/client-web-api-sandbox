import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProgressDocument,
  type ProgressDocument,
  parseProgressDocument,
  recordObservation,
  solveBox,
} from "../domain/progress";
import type { Locale } from "../i18n";
import {
  IndexedDbProgressStore,
  type ProgressStore,
} from "../infra/progressStore";
import { clearSynchronousFlags } from "../infra/synchronousFlags";

export type StorageState =
  | "loading"
  | "ready"
  | "unavailable"
  | "corrupt"
  | "future";

export interface ProgressController {
  document: ProgressDocument;
  storageState: StorageState;
  setLocale(locale: Locale): void;
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
  replaceDocument(
    change: (current: ProgressDocument) => ProgressDocument,
  ): void;
  reset(): Promise<void>;
}

export function useProgress(
  initialLocale: Locale,
  store: ProgressStore = new IndexedDbProgressStore(),
): ProgressController {
  const storeRef = useRef(store);
  const [document, setDocument] = useState(() =>
    createProgressDocument(initialLocale),
  );
  const initialDocumentRef = useRef(document);
  const [storageState, setStorageState] = useState<StorageState>("loading");

  useEffect(() => {
    let active = true;
    void storeRef.current
      .load()
      .then(async (raw) => {
        if (!active) return;
        if (raw === null) {
          await storeRef.current.save(initialDocumentRef.current);
          if (active) setStorageState("ready");
          return;
        }

        const parsed = parseProgressDocument(raw);
        if (parsed.status === "future") {
          setStorageState("future");
          return;
        }
        if (parsed.status === "corrupt") {
          setStorageState("corrupt");
          return;
        }

        setDocument(parsed.document);
        setStorageState("ready");
        if (parsed.migrated) await storeRef.current.save(parsed.document);
      })
      .catch(() => {
        if (active) setStorageState("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const replaceDocument = useCallback(
    (change: (current: ProgressDocument) => ProgressDocument) => {
      setDocument((current) => {
        const next = change(current);
        if (next !== current && storageState === "ready") {
          void storeRef.current
            .save(next)
            .catch(() => setStorageState("unavailable"));
        }
        return next;
      });
    },
    [storageState],
  );

  const setLocale = useCallback(
    (locale: Locale) => {
      replaceDocument((current) =>
        current.settings.locale === locale
          ? current
          : {
              ...current,
              updatedAt: new Date().toISOString(),
              settings: { ...current.settings, locale },
            },
      );
    },
    [replaceDocument],
  );

  const reset = useCallback(async () => {
    const next = createProgressDocument(document.settings.locale);
    await storeRef.current.clear();
    clearSynchronousFlags();
    await storeRef.current.save(next);
    setDocument(next);
    setStorageState("ready");
  }, [document.settings.locale]);

  const solve = useCallback(
    (boxId: string, facts: readonly string[] = []) => {
      replaceDocument((current) => solveBox(current, boxId, facts));
    },
    [replaceDocument],
  );

  const observe = useCallback(
    (observationId: string, facts: readonly string[] = []) => {
      replaceDocument((current) =>
        recordObservation(current, observationId, facts),
      );
    },
    [replaceDocument],
  );

  return {
    document,
    storageState,
    setLocale,
    solve,
    observe,
    replaceDocument,
    reset,
  };
}
