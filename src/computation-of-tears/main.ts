// Three.jsのモジュールをインポート
import * as THREE from "three";
// TextGeometryとFontLoaderのインポート
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import { BEAT_TIME } from "./consts/animation";
import { textLineScript } from "./consts/textLineScript";
import NotoSerifJPBold from "./public/font/Noto_Serif_JP_Bold.json?url";
import { TextLine } from "./TextLine";

import type { Font } from "three/addons/loaders/FontLoader.js";

/**
 * デバッグモード
 */
const DEBUG_MODE: boolean = true;
/**
 * デバッグ用 そのステップで止まる
 */
const DEBUG_STOP_STEP: number = 4;

// フォントのパス
const FONT_PATH = NotoSerifJPBold;

// 要素のID
const CONTAINER_ID = "container";
const LOG_ID = "log";

// 描画画面サイズ
const SCREEN_WIDTH = 750;
const SCREEN_HEIGHT = 500;
const SCREEN_RATIO = SCREEN_WIDTH / SCREEN_HEIGHT;

// 背景色
const BACKGROUND_COLOR = 0x651515; // 暗い赤

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
 *
 * MEMO: 別に、レンダラーは4kサイズとかででっかく作っといて、CSSで画面いっぱいするでも良い気はする。
 * マウス位置とかも使うようになるとピクセルを一対一で合わせたいかもしれないから、そうなってくるとこの関数が有用かも。
 */
function setRendererSize(
  renderer: THREE.WebGLRenderer,
  x: number,
  y: number,
): void {
  // アスペクト比はそのままにできるだけ画面いっぱいで表示
  if (x / y > SCREEN_RATIO) {
    renderer.setSize(y * SCREEN_RATIO, y);
  } else {
    renderer.setSize(x, x / SCREEN_RATIO);
  }
}

/**
 * アニメーションループを開始する関数
 */
function startAnimation(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  textLineInstances: TextLine[],
) {
  let animationId: number;
  let elapsedTime = 0;

  // アニメーションのためのクロック
  const clock = new THREE.Clock();

  // キーボード状態の管理
  const keys = {
    enter: false,
    space: false,
    shift: false,
    control: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  // キーボードイベントハンドラ
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.code) {
      case "Enter":
        keys.enter = true;
        break;
      case "Space":
        keys.space = true;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        keys.shift = true;
        break;
      case "ControlLeft":
      case "ControlRight":
        keys.control = true;
        break;
      case "ArrowLeft":
        keys.left = true;
        break;
      case "ArrowRight":
        keys.right = true;
        break;
      case "ArrowUp":
        keys.up = true;
        break;
      case "ArrowDown":
        keys.down = true;
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.code) {
      case "Enter":
        keys.enter = false;
        break;
      case "Space":
        keys.space = false;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        keys.shift = false;
        break;
      case "ControlLeft":
      case "ControlRight":
        keys.control = false;
        break;
      case "ArrowLeft":
        keys.left = false;
        break;
      case "ArrowRight":
        keys.right = false;
        break;
      case "ArrowUp":
        keys.up = false;
        break;
      case "ArrowDown":
        keys.down = false;
        break;
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // 情報表示用のDOM要素
  const infoElement = document.createElement("div");
  infoElement.style.position = "fixed";
  infoElement.style.top = "0";
  infoElement.style.left = "0";
  infoElement.style.color = "white";
  infoElement.style.padding = "10px";
  document.body.appendChild(infoElement);

  function interact(deltaTime: number): number {
    let additionalTime = 1;
    let factor = 1;

    // Enterで最初から
    if (keys.enter) {
      elapsedTime = 0;
      return elapsedTime;
    }

    // Spaceが押されている間時間をとめる
    if (keys.space) {
      return elapsedTime;
    }

    if (keys.shift) {
      factor = 4;
    }
    if (keys.control) {
      factor = 0.25;
    }

    if (keys.left) {
      additionalTime -= 2;
    }
    if (keys.right) {
      additionalTime += 1;
    }
    if (keys.up) {
      additionalTime -= 11;
    }
    if (keys.down) {
      additionalTime += 10;
    }

    elapsedTime += additionalTime * deltaTime * 1000 * factor;
    if (elapsedTime < 0) elapsedTime = 0;

    return elapsedTime;
  }

  /**
   * アニメーションを更新する関数
   *
   * イメージとしては、アニメーション関数に同じ時間currentTimeを与えると同じ表示になるような純粋関数として扱えるようにする。
   */
  function animate(): void {
    // 次のフレームでもanimate関数を呼び出す
    animationId = requestAnimationFrame(animate);

    // デルタタイムを取得
    const deltaTime = clock.getDelta();

    // 時間制御
    interact(deltaTime);

    if (DEBUG_MODE) {
      // デバッグ用 任意のタイミングでアニメーションの再生を止める
      elapsedTime = Math.min(elapsedTime, BEAT_TIME * DEBUG_STOP_STEP);
    }

    infoElement.textContent = `elapsedTime: ${Math.floor(elapsedTime)}`;

    // 各テキストラインのアニメーションを更新
    textLineInstances.forEach((textLine) => {
      textLine.setElapsedTime(elapsedTime); // 同じcurrentTimeを与えると必ず同じ表示になる
      textLine.update();
    });

    // シーンをレンダリング
    renderer.render(scene, camera);
  }

  // アニメーションを開始
  animationId = requestAnimationFrame(animate);

  return {
    animationId,
    cleanup: () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      document.body.removeChild(infoElement);
    },
  };
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
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(BACKGROUND_COLOR, 1);

  // カメラの位置を設定
  camera.position.z = 1000;

  // デバッグモードの場合、グリッドを追加
  let gridHelper: THREE.GridHelper | null = null;
  const gridLines: THREE.Line[] = [];
  if (DEBUG_MODE) {
    // グリッドサイズと分割数を設定（50単位間隔）
    const gridSize = Math.max(SCREEN_WIDTH, SCREEN_HEIGHT) * 2;
    const gridDivisions = Math.floor(gridSize / 50);

    // グリッドヘルパーを作成
    gridHelper = new THREE.GridHelper(gridSize, gridDivisions);

    // XY平面に表示するため90度回転（デフォルトはXZ平面）
    gridHelper.rotation.x = Math.PI / 2;

    // カメラとオブジェクトの間に表示するため、少し手前に配置
    gridHelper.position.z = -10;

    // シーンに追加
    scene.add(gridHelper);

    // 原点を示す中心線の追加（X軸、Y軸）
    const axisLength = gridSize / 2;

    // X軸（赤）
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, -5),
      new THREE.Vector3(axisLength, 0, -5),
    ]);
    const xAxisMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.7,
      linewidth: 2, // 実際には多くのブラウザでは効果がない
    });
    const xAxis = new THREE.Line(xAxisGeometry, xAxisMaterial);
    scene.add(xAxis);
    gridLines.push(xAxis);

    // Y軸（緑）
    const yAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLength, -5),
      new THREE.Vector3(0, axisLength, -5),
    ]);
    const yAxisMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.7,
      linewidth: 2,
    });
    const yAxis = new THREE.Line(yAxisGeometry, yAxisMaterial);
    scene.add(yAxis);
    gridLines.push(yAxis);

    // 50単位ごとの目盛りを追加
    const tickSize = 10; // 目盛りの大きさ
    const maxTicks = Math.floor(axisLength / 50);

    for (let i = 1; i <= maxTicks; i++) {
      const distance = i * 50; // 50単位ごと

      // X軸の正方向の目盛り
      const xTickGeometryPos = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(distance, -tickSize / 2, -5),
        new THREE.Vector3(distance, tickSize / 2, -5),
      ]);
      const xTickPos = new THREE.Line(xTickGeometryPos, xAxisMaterial);
      scene.add(xTickPos);
      gridLines.push(xTickPos);

      // X軸の負方向の目盛り
      const xTickGeometryNeg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-distance, -tickSize / 2, -5),
        new THREE.Vector3(-distance, tickSize / 2, -5),
      ]);
      const xTickNeg = new THREE.Line(xTickGeometryNeg, xAxisMaterial);
      scene.add(xTickNeg);
      gridLines.push(xTickNeg);

      // Y軸の正方向の目盛り
      const yTickGeometryPos = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-tickSize / 2, distance, -5),
        new THREE.Vector3(tickSize / 2, distance, -5),
      ]);
      const yTickPos = new THREE.Line(yTickGeometryPos, yAxisMaterial);
      scene.add(yTickPos);
      gridLines.push(yTickPos);

      // Y軸の負方向の目盛り
      const yTickGeometryNeg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-tickSize / 2, -distance, -5),
        new THREE.Vector3(tickSize / 2, -distance, -5),
      ]);
      const yTickNeg = new THREE.Line(yTickGeometryNeg, yAxisMaterial);
      scene.add(yTickNeg);
      gridLines.push(yTickNeg);
    }
  }

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

  // テキストラインのインスタンスを作成
  const textLineInstances = textLineScript.map(
    (textLine) => new TextLine(textLine, font, scene),
  );

  // アニメーション
  const { animationId, cleanup } = startAnimation(
    renderer,
    scene,
    camera,
    textLineInstances,
  );

  // リソース解放関数を返す
  return {
    dispose: (): void => {
      // アニメーションの停止
      cancelAnimationFrame(animationId);

      // キーボードイベントとDOM要素の削除
      cleanup();

      // テキストラインのリソース解放
      textLineInstances.forEach((textLine) => textLine.dispose());

      // グリッドヘルパーを削除
      if (gridHelper) {
        scene.remove(gridHelper);
        gridHelper.dispose();
      }

      // グリッドラインを削除
      gridLines.forEach((line) => {
        scene.remove(line);
        line.geometry.dispose();
        if (line.material instanceof THREE.Material) {
          line.material.dispose();
        } else if (Array.isArray(line.material)) {
          line.material.forEach((mat: THREE.Material) => mat.dispose());
        }
      });
      gridLines.length = 0; // 配列をクリア

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
