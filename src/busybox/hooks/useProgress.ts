import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProgressDocument,
  hasStageMarker,
  markStage,
  type ProgressDocument,
  parseProgressDocument,
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
  solve(stageId: string, boxId: string): void;
  hasMarker(stageId: string, marker: string): boolean;
  mark(stageId: string, marker: string): void;
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
    (stageId: string, boxId: string) => {
      replaceDocument((current) => solveBox(current, stageId, boxId));
    },
    [replaceDocument],
  );

  const hasMarker = useCallback(
    (stageId: string, marker: string) =>
      hasStageMarker(document, stageId, marker),
    [document],
  );

  const mark = useCallback(
    (stageId: string, marker: string) => {
      replaceDocument((current) => markStage(current, stageId, marker));
    },
    [replaceDocument],
  );

  return {
    document,
    storageState,
    setLocale,
    solve,
    hasMarker,
    mark,
    replaceDocument,
    reset,
  };
}
