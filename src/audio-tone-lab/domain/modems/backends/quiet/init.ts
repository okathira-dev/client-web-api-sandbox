import { quietDebugLog } from "./debugLog";
import { installQuietEmscriptenGlobals } from "./emscriptenGlobals";

type QuietModule = typeof import("quietjs-bundle").default;

const READY_TIMEOUT_MS = 45_000;

let readyPromise: Promise<QuietModule> | null = null;

export function ensureQuietReady(): Promise<QuietModule> {
  if (readyPromise) return readyPromise;
  const t0 = performance.now();
  readyPromise = (async () => {
    quietDebugLog("quiet/init.ts:start", "ensureQuietReady started", "A-B", {
      t0,
    });
    installQuietEmscriptenGlobals();
    const tImport0 = performance.now();
    quietDebugLog("quiet/init.ts:import0", "dynamic import begin", "A", {
      msSinceStart: tImport0 - t0,
    });
    const mod = await import("quietjs-bundle");
    const tImport1 = performance.now();
    quietDebugLog("quiet/init.ts:import1", "dynamic import done", "A-E", {
      importMs: tImport1 - tImport0,
      modKeys: Object.keys(mod),
      hasDefault: mod.default != null,
      defaultKeys:
        mod.default != null ? Object.keys(mod.default).slice(0, 12) : [],
      hasAddReadyCallback:
        mod.default != null &&
        typeof mod.default.addReadyCallback === "function",
    });
    const quiet = mod.default;
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        quietDebugLog(
          "quiet/init.ts:timeout",
          "addReadyCallback timeout",
          "B",
          { waitedMs: performance.now() - tImport1 },
        );
        reject(new Error("Quiet.js ready timeout (45s)"));
      }, READY_TIMEOUT_MS);
      quiet.addReadyCallback(
        () => {
          window.clearTimeout(timer);
          quietDebugLog("quiet/init.ts:ready", "addReadyCallback fired", "B", {
            readyMs: performance.now() - t0,
          });
          resolve();
        },
        (error) => {
          window.clearTimeout(timer);
          quietDebugLog("quiet/init.ts:fail", "addReadyCallback error", "B", {
            error: String(error),
          });
          reject(error ?? new Error("Quiet.js failed to initialize"));
        },
      );
    });
    return quiet;
  })();
  return readyPromise;
}

export async function getQuiet(): Promise<QuietModule> {
  return ensureQuietReady();
}
