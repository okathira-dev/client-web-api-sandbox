// Three.jsのモジュールをインポート
import * as THREE from "three";
// TextGeometryとFontLoaderのインポート
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import type { Font } from "three/addons/loaders/FontLoader.js";

// フォントのパス
const FONT_PATH = "./public/font/Noto_Serif_JP_Bold.json";

// 要素のID
const CONTAINER_ID = "container";
const LOG_ID = "log";

// 描画画面サイズ
const SCREEN_WIDTH = 750;
const SCREEN_HEIGHT = 500;
const SCREEN_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

/**
 * エラーメッセージを表示する関数
 */
function showError(
  logElement: HTMLElement | null,
  message: string,
  error: unknown,
): void {
  if (!logElement) return;

  logElement.innerHTML = `
    ${message}<br>
    <small>${error instanceof Error ? error.message : String(error)}</small>
  `;
  logElement.style.color = "#ff4444";
}

/**
 * 表示に使うDOM要素を取得する関数
 */
function getDOMElements(id: string): HTMLElement {
  const element = document.getElementById(id) as HTMLElement;

  if (!element) {
    throw new Error("DOM要素の取得に失敗しました");
  }

  return element;
}

/**
 * フォントローダーを使用してフォントをロードする関数
 */
function loadFont(logElement: HTMLElement): Promise<Font> {
  return new Promise((resolve, reject) => {
    // ローディングテキストの表示
    logElement.innerHTML = "フォントをロード中...";

    // FontLoaderの初期化
    const loader = new FontLoader();

    loader.load(
      FONT_PATH,
      // ロード成功時のコールバック
      (loadedFont) => {
        // ローディング表示を非表示にする
        logElement.style.display = "none";

        console.info("フォントロード成功:", loadedFont);
        resolve(loadedFont);
      },
      // ロード進捗時のコールバック
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        logElement.innerHTML = `フォントをロード中 (${FONT_PATH}): ${Math.round(percentComplete)}%`;
      },
      // ロードエラー時のコールバック
      (error: unknown) => {
        console.warn(`${FONT_PATH} からのフォントロードに失敗しました:`, error);
        showError(logElement, "フォントのロードに失敗しました", error);
        // Errorオブジェクトでラップして拒否
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * レンダラーのサイズを設定する関数
 */
function setRendererSize(
  renderer: THREE.WebGLRenderer,
  x: number,
  y: number,
): void {
  if (x < y) {
    renderer.setSize(x, x / SCREEN_RATIO);
  } else {
    renderer.setSize(y * SCREEN_RATIO, y);
  }
}

/**
 * アニメーションループを開始する関数
 */
function startAnimation(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
) {
  let animationId: number;

  // アニメーションのためのクロック
  // const clock = new THREE.Clock();

  function animate(): void {
    // 次のフレームでもanimate関数を呼び出す
    animationId = requestAnimationFrame(animate);

    // アニメーション処理

    // シーンをレンダリング
    renderer.render(scene, camera);
  }

  // アニメーションを開始
  animationId = requestAnimationFrame(animate);

  return animationId;
}

/**
 * アプリケーションの初期化
 */
const init = async (): Promise<{ dispose: () => void }> => {
  // DOM要素の取得
  const container = getDOMElements(CONTAINER_ID);
  const logElement = getDOMElements(LOG_ID);

  // レンダリング要素の初期化
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -SCREEN_WIDTH / 2,
    SCREEN_WIDTH / 2,
    SCREEN_HEIGHT / 2,
    -SCREEN_HEIGHT / 2,
    0,
    2000,
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  // カメラの位置を設定
  camera.position.z = 1000;

  // レンダラーのサイズを設定
  setRendererSize(renderer, window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // ウィンドウリサイズ時のイベントハンドラ
  const handleResize = () => {
    setRendererSize(renderer, window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", handleResize);

  // フォントのロード
  const font = await loadFont(logElement);

  // テキストを作成
  const geometry = new TextGeometry("こんにちは、Three.js!", {
    font,
    size: 18, // テキストのサイズ
    depth: 0.1, // テキストの厚み（奥行き）
    // curveSegments: 4, // 曲線の品質（値が大きいほど滑らか）
    // bevelEnabled: false, // ベベル（角の丸み）を無効化
  });
  const material = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const textMesh = new THREE.Mesh(geometry, material);
  scene.add(textMesh);

  // アニメーション
  const animationId = startAnimation(renderer, scene, camera);

  // リソース解放関数を返す
  return {
    dispose: (): void => {
      // アニメーションの停止
      cancelAnimationFrame(animationId);

      // テキスト表示のリソース解放
      textMesh.geometry.dispose();
      textMesh.material.dispose();

      // イベントリスナーの削除
      window.removeEventListener("resize", handleResize);

      // レンダラーの破棄
      renderer.dispose();
    },
  };
};

// アプリケーションの開始
document.addEventListener("DOMContentLoaded", () => {
  init()
    .then(({ dispose }) => {
      // クリーンアップ（SPAなどで必要な場合）
      window.addEventListener("beforeunload", () => {
        dispose();
      });
    })
    .catch((error) => {
      console.error("初期化エラー:", error);
      const logElement = getDOMElements(LOG_ID);
      showError(logElement, "アプリケーションの初期化に失敗しました", error);
    });
});
