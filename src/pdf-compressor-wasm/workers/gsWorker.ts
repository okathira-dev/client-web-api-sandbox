// Ghostscript を Web Worker 内で実行し、print/printErr をリアルタイムに転送するワーカー。

// Vite に wasm アセットを認識させるため URL import を使う
import gsFactory from "@okathira/ghostpdl-wasm/gs.js";
import wasmUrl from "@okathira/ghostpdl-wasm/gs.wasm?url";

// 本来であれば compilerOptions.lib に "WebWorker" を入れれば自動的に型が適応されるのではないかと思うが、
// "@types/dom-mediacapture-transform" が効かなくなってしまうため、ここで宣言する。
// このファイルは Worker として呼ばれる
declare const self: Worker;

// ワーカーメッセージの型（In/Out）をワーカー側で宣言
type RunMessage = {
  type: "run";
  buffer: ArrayBuffer;
  args: string[];
};

export type WorkerMessageIn = RunMessage;
export type WorkerMessageOut =
  | { type: "log"; line: string }
  | { type: "done"; output: ArrayBuffer }
  | { type: "error"; error: string };

let modulePromise: Promise<GhostscriptModule> | null = null;
let cachedModule: GhostscriptModule | null = null;

async function loadModule(): Promise<GhostscriptModule> {
  if (cachedModule) return cachedModule;
  if (!modulePromise) {
    modulePromise = (async () => {
      const mod = await gsFactory({
        locateFile: (path: string) => (path.endsWith(".wasm") ? wasmUrl : path),
        // Emscripten の print/printErr をメインスレッドへ転送
        print: (t) => {
          self.postMessage({ type: "log", line: t });
        },
        printErr: (t) => {
          self.postMessage({ type: "log", line: t });
        },
      });

      cachedModule = mod;
      return mod;
    })();
  }
  return modulePromise;
}

onmessage = async (ev: MessageEvent<WorkerMessageIn>) => {
  const msg = ev.data;
  if (msg.type !== "run") return;

  const args = msg.args;
  const inputBuffer = new Uint8Array(msg.buffer);

  try {
    const mod = await loadModule();

    // 作業ディレクトリ準備
    let hasWorking = false;
    try {
      const entries = mod.FS.readdir("/");
      hasWorking = entries.includes("working");
    } catch (_err) {
      hasWorking = false;
    }
    if (!hasWorking) {
      mod.FS.mkdir("/working");
    }

    // 入力書き込み
    mod.FS.writeFile("/working/input.pdf", inputBuffer);

    // 既存の出力があれば削除
    try {
      mod.FS.readFile("/working/output.pdf");
      mod.FS.unlink("/working/output.pdf");
    } catch (_err) {
      // 無ければ無視
    }

    // 実行（print/printErr は逐次 postMessage 済み）
    mod.callMain(args);

    // 出力取得
    const outBytes = mod.FS.readFile("/working/output.pdf", {
      encoding: "binary",
    });
    // 転送最適化のため ArrayBuffer を Transferable として送る
    self.postMessage({ type: "done", output: outBytes.buffer }, [
      outBytes.buffer,
    ]);
  } catch (e) {
    self.postMessage({
      type: "error",
      error: String(e),
    });
  }
};
