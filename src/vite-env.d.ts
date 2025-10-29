// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

declare module "*.wasm?url" {
  const url: string;
  export default url;
}

// Ghostscript Emscripten Module の最小限の型
interface GhostscriptModule extends EmscriptenModule {
  callMain: (args: string[]) => void;
  FS: typeof FS;
}

declare module "*/gs.js" {
  const factory: EmscriptenModuleFactory<GhostscriptModule>;
  export default factory;
}
