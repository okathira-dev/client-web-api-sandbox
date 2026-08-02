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
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const finish = (settle: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", rejectForAbort);
      settle();
    };
    const rejectForAbort = () => {
      finish(() => {
        reject(createAbortError());
      });
    };
    const timeoutId = setTimeout(() => {
      finish(() => {
        reject(new Error(`${label}-timeout`));
      });
    }, timeoutMs);

    if (signal.aborted) {
      rejectForAbort();
      return;
    }
    signal.addEventListener("abort", rejectForAbort, { once: true });
    promise.then(
      (value) => {
        // 期限切れ・中断後に元の Promise が完了しても、先に確定した結果を上書きしない。
        finish(() => {
          resolve(value);
        });
      },
      (error: unknown) => {
        // 上と同じく、打ち切った処理の遅延失敗を二重に通知しない。
        finish(() => {
          reject(error);
        });
      },
    );
  });
};

/** 例外メッセージを、保存しても差し支えない長さの文字列にする。 */
export const describeError = (error: unknown): string => {
  const message =
    error instanceof Error ? error.message : String(error ?? "unknown-error");
  return message.slice(0, 300);
};
