/** 中断とタイムアウトを扱う小さなヘルパー。 */

export const createAbortError = (): DOMException =>
  new DOMException("Inspection cancelled", "AbortError");

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

export const throwIfAborted = (signal: AbortSignal): void => {
  if (signal.aborted) throw createAbortError();
};

/** マクロタスクを 1 回譲る。0 のときはタイマーを張らずに済ませたい箇所で使う。 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * 中断シグナルと制限時間のどちらか早いほうで打ち切る。
 *
 * ハングしたエンコーダー実装に当たっても、その候補だけを失敗として記録し、
 * 検査全体は次の候補へ進めるようにするのが目的。
 */
export const withDeadline = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal: AbortSignal,
  label: string,
): Promise<T> => {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const combined = AbortSignal.any([signal, timeoutSignal]);

  return new Promise<T>((resolve, reject) => {
    const rejectForAbort = () => {
      reject(
        timeoutSignal.aborted
          ? new Error(`${label}-timeout`)
          : createAbortError(),
      );
    };
    if (combined.aborted) {
      rejectForAbort();
      return;
    }
    combined.addEventListener("abort", rejectForAbort, { once: true });
    promise.then(resolve, reject).finally(() => {
      combined.removeEventListener("abort", rejectForAbort);
    });
  });
};

/** 例外メッセージを、保存しても差し支えない長さの文字列にする。 */
export const describeError = (error: unknown): string => {
  const message =
    error instanceof Error ? error.message : String(error ?? "unknown-error");
  return message.slice(0, 300);
};
