/**
 * quiet-emscripten.js が参照するグローバル変数。
 * Vite バンドル後は strict スコープになり、Quiet.init 前に ReferenceError になるため先に定義する。
 */
export function installQuietEmscriptenGlobals() {
  const root = globalThis as typeof globalThis & {
    memoryInitializerPrefixURL?: string;
  };
  if (root.memoryInitializerPrefixURL === undefined) {
    root.memoryInitializerPrefixURL = "";
  }
}
