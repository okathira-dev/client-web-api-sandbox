// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_CLIENT_ID?: string;
}

// Vite の型定義を拡張
declare module "vite/client" {
  interface ImportMetaEnv {
    readonly VITE_YOUTUBE_CLIENT_ID?: string;
  }
}
