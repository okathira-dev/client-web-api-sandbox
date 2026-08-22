import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const root = resolve(import.meta.dirname, "src"); // srcフォルダをrootにする。マルチページのフォルダをsrcにまとめたい＆変に階層を増やしたくない。
const outDir = resolve(import.meta.dirname, "dist"); // でも当然ビルドフォルダはsrcの外にしたい

const paymentManifestRoutes = new Map([
  ["/busybox/payment/method", "/busybox/payment/payment-method-manifest.json"],
  [
    "/busybox/poc/payment/method",
    "/busybox/poc/payment/payment-method-manifest.json",
  ],
  [
    "/busybox/poc/payment/decoy-method",
    "/busybox/poc/payment/decoy-payment-method-manifest.json",
  ],
]);

function paymentManifestLinkPlugin(): Plugin {
  const handle = (
    request: { url?: string },
    response: {
      statusCode: number;
      setHeader(name: string, value: string): void;
      end(body?: string): void;
    },
    next: () => void,
  ) => {
    const pathname = new URL(request.url ?? "/", "http://busybox.local")
      .pathname;
    const manifestPath = paymentManifestRoutes.get(pathname);
    if (!manifestPath) {
      next();
      return;
    }

    response.statusCode = 204;
    response.setHeader(
      "Link",
      `<${manifestPath}>; rel="payment-method-manifest"`,
    );
    response.setHeader("Cache-Control", "no-store");
    response.end();
  };

  return {
    name: "busybox-payment-method-manifest-link",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== "HEAD" && request.method !== "GET") {
          next();
          return;
        }
        handle(request, response, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.method !== "HEAD" && request.method !== "GET") {
          next();
          return;
        }
        handle(request, response, next);
      });
    },
  };
}

export default defineConfig({
  base: "./", // JSのimportが相対パスになる。ビルドしたフォルダ単体で動くので便利。
  root,
  // The app root is src/, but developer-only VITE_* variables live beside
  // package.json and are intentionally excluded from Git there.
  envDir: import.meta.dirname,
  appType: "mpa", // マルチページアプリケーションとして設定（SPAフォールバックを無効化）。kojo-xml-viewerで404の反応を見る必要があるため。
  assetsInclude: ["**/*.pack"],
  plugins: [react(), paymentManifestLinkPlugin()],
  // 開発時ファイル変更を検知できないなどあればこれを有効にする
  // server: {
  //   watch: {
  //     usePolling: true,
  //   },
  // },
  worker: {
    // ビルド時にワーカーを ES モジュール形式で出力（コードスプリット互換）
    format: "es",
  },
  build: {
    outDir,
    emptyOutDir: true,
    rolldownOptions: {
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
        "kojo-xml-viewer": resolve(root, "kojo-xml-viewer", "index.html"),
        busybox: resolve(root, "busybox", "index.html"),
        "encoder-capability-inspector": resolve(
          root,
          "encoder-capability-inspector",
          "index.html",
        ),
        "busybox-poc": resolve(root, "busybox", "poc", "index.html"),
        "busybox-poc-offline-beacon-receiver": resolve(
          root,
          "busybox",
          "poc",
          "offline-beacon",
          "receiver.html",
        ),
        "busybox-poc-presentation-receiver": resolve(
          root,
          "busybox",
          "poc",
          "presentation-receiver.html",
        ),
        "busybox-s710-tool": resolve(
          root,
          "busybox",
          "tools",
          "s710",
          "index.html",
        ),
      },
    },
  },
});
