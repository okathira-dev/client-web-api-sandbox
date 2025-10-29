// Web Worker ベースのランナー。
// ワーカーからのログを逐次受け取り、必要に応じてコールバックで通知する。

import type { WorkerMessageOut } from "./gsWorker";

export async function runGhostscriptWasm(
  file: File,
  args: string[],
  onLog?: (line: string) => void,
): Promise<{ output: Blob; logs: string }> {
  const worker = new Worker(new URL("./gsWorker.ts", import.meta.url), {
    type: "module",
  });

  let logs = "";

  const arrayBuffer = await file.arrayBuffer();

  const result = await new Promise<{ output: Blob; logs: string }>(
    (resolve, reject) => {
      const handleMessage = (ev: MessageEvent<WorkerMessageOut>) => {
        const msg = ev.data;
        if (msg.type === "log") {
          logs += msg.line + "\n";
          onLog?.(msg.line);
          return;
        }
        if (msg.type === "done") {
          const blob = new Blob([msg.output], { type: "application/pdf" });
          cleanup();
          resolve({ output: blob, logs });
          return;
        }
        if (msg.type === "error") {
          cleanup();
          reject(new Error(logs + `ERROR: ${msg.error}`));
          return;
        }
      };
      const handleError = (err: ErrorEvent) => {
        cleanup();
        reject(new Error(logs + `ERROR: ${err.message}`));
      };
      const cleanup = () => {
        worker.removeEventListener("message", handleMessage);
        worker.removeEventListener("error", handleError);
        worker.terminate();
      };

      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);

      // 実行リクエスト送信（PDFバッファは Transferable）
      worker.postMessage({ type: "run", buffer: arrayBuffer, args }, [
        arrayBuffer,
      ]);
    },
  );

  return result;
}
