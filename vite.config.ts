import { resolve } from "path";

import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src"); // srcフォルダをrootにする。マルチページのフォルダをsrcにまとめたい＆変に階層を増やしたくない。
const outDir = resolve(__dirname, "dist"); // でも当然ビルドフォルダはsrcの外にしたい

export default defineConfig({
  base: "./", // JSのimportが相対パスになる。ビルドしたフォルダ単体で動くので便利。
  root,
  envDir: resolve(__dirname, "."), // 環境変数ファイルをプロジェクトルートから読み込む
  plugins: [react()],
  server: {
    headers: {
      // Google Identity Services との互換性のため
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
  },
  worker: {
    // ビルド時にワーカーを ES モジュール形式で出力（コードスプリット互換）
    format: "es",
  },
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(root, "index.html"),
        "webcodecs-data-moshing": resolve(
          root,
          "webcodecs-data-moshing",
          "index.html",
        ),
        "webcodecs-data-moshing-react": resolve(
          root,
          "webcodecs-data-moshing-react",
          "index.html",
        ),
        "button-accordion-with-keyboard": resolve(
          root,
          "button-accordion-with-keyboard",
          "index.html",
        ),
        "lcg-predictor": resolve(root, "lcg-predictor", "index.html"),
        "computation-of-tears": resolve(
          root,
          "computation-of-tears",
          "index.html",
        ),
        "pdf-compressor-wasm": resolve(
          root,
          "pdf-compressor-wasm",
          "index.html",
        ),
        "youtube-playlist-cleaner": resolve(
          root,
          "youtube-playlist-cleaner",
          "index.html",
        ),
      },
    },
  },
});
