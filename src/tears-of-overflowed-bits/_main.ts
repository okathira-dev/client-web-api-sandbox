// このファイルの型チェックやlintは無視する
/* eslint-disable */
// @ts-nocheck

import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

import { BEAT_TIME, DEFAULT_FONT_SIZE } from ".";
import { textLines } from "./consts/textLines";
import { easingFuncList } from "./utils/easings";

import type { AnimParam, TextLine } from ".";
import type { Font } from "three/addons/loaders/FontLoader.js";
/**
 * 画面サイズ
 */
const WIDTH = 750;
const HEIGHT = 500;

/**
 * オブジェクトデータを保持する構造体
 */
interface TextObjectData {
  textLine?: TextLine;
  letterAnimParams?: AnimParam[];
  initialPosition: THREE.Vector3;
  initialRotation: THREE.Euler;
}

/**
 * メインクラス
 */
class TearsOfOverflowedBits {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private elapsedTime = 0;
  private isPaused = false;
  private timeFactor = 1;
  private additionalTime = 1;
  private infoElement: HTMLElement;
  private textGroups: THREE.Group[] = [];
  private font?: Font;
  private clock = new THREE.Clock();
  private loadingElement: HTMLElement | null;

  // オブジェクトIDとデータを対応づけるマップ
  private objectDataMap = new Map<string, TextObjectData>();

  constructor() {
    // 親コンテナを取得
    const container = document.getElementById("container");
    if (!container) {
      throw new Error("Container element not found");
    }

    // ロード中表示の参照を保持
    this.loadingElement = document.getElementById("loading");

    // レンダラーの設定
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(WIDTH, HEIGHT);
    this.renderer.setClearColor(0x5a1212); // 背景色を設定
    container.appendChild(this.renderer.domElement);

    // シーンの設定
    this.scene = new THREE.Scene();

    // 等角図法カメラの設定
    // OrthographicCamera(left, right, top, bottom, near, far)
    const aspectRatio = WIDTH / HEIGHT;
    const cameraHeight = HEIGHT;
    const cameraWidth = cameraHeight * aspectRatio;
    this.camera = new THREE.OrthographicCamera(
      -cameraWidth / 2, // left
      cameraWidth / 2, // right
      cameraHeight / 2, // top
      -cameraHeight / 2, // bottom
      1, // near
      1000, // far
    );
    this.camera.position.z = 500;

    // 光源の設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    // 情報表示用要素
    this.infoElement = document.createElement("div");
    this.infoElement.className = "instructions";
    this.infoElement.innerHTML = `
      Enter: 最初に戻る<br>
      Space: 一時停止<br>
      ←, →: 逆・倍速再生<br>
      ↑, ↓: 10倍の逆・倍速再生<br>
      Ctrl, Shift: 時の進みを4分の1倍, 4倍
    `;
    container.appendChild(this.infoElement);

    // キーボードイベントの設定
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));

    // リサイズイベントの設定
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // FontLoaderを使ってJSONフォントを読み込む
    this.loadFont();
  }

  /**
   * フォントをロード
   */
  private loadFont(): void {
    if (this.loadingElement) {
      this.loadingElement.innerHTML +=
        "<br><small>フォントをロード中...</small>";
    }

    const loader = new FontLoader();

    // JSONフォントをロード
    loader.load(
      "./public/font/Noto Serif JP_Bold.json",
      // 成功時のコールバック
      (font) => {
        this.font = font;
        this.createTextLines();
        this.startAnimation();

        // ロード中表示を非表示にする
        if (this.loadingElement) {
          this.loadingElement.style.display = "none";
        }
      },
      // 進捗時のコールバック
      (xhr) => {
        if (this.loadingElement && xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          this.loadingElement.innerHTML = `フォントをロード中... ${percent}%`;
        }
      },
      // エラー時のコールバック
      (err) => {
        console.error("フォントのロードに失敗しました:", err);
        if (this.loadingElement) {
          this.loadingElement.innerHTML =
            "フォントのロードに失敗しました。ページをリロードしてください。";
        }
      },
    );
  }

  /**
   * アニメーション開始
   */
  private startAnimation(): void {
    // タイムリセット
    this.clock.start();
    // アニメーションループ開始
    this.animate();
  }

  /**
   * キーダウンイベントハンドラ
   */
  private handleKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case "Enter":
        // Enterで最初から
        this.elapsedTime = 0;
        break;
      case " ":
        // スペースでポーズ/再開
        this.isPaused = !this.isPaused;
        break;
      case "ArrowLeft":
        // 左矢印で巻き戻し
        this.additionalTime = -1;
        break;
      case "ArrowRight":
        // 右矢印で早送り
        this.additionalTime = 2;
        break;
      case "ArrowUp":
        // 上矢印で高速巻き戻し
        this.additionalTime = -10;
        break;
      case "ArrowDown":
        // 下矢印で高速早送り
        this.additionalTime = 11;
        break;
      case "Control":
        // Ctrlで1/4速
        this.timeFactor = 0.25;
        break;
      case "Shift":
        // Shiftで4倍速
        this.timeFactor = 4;
        break;
    }
  }

  /**
   * キーアップイベントハンドラ
   */
  private handleKeyUp(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
      case "ArrowUp":
      case "ArrowDown":
        // 矢印キーを離したら通常速度に戻す
        this.additionalTime = 1;
        break;
      case "Control":
      case "Shift":
        // Ctrl/Shiftを離したら通常速度に戻す
        this.timeFactor = 1;
        break;
    }
  }

  /**
   * オブジェクトにIDを割り当て、データを登録する
   */
  private registerObjectData(
    object: THREE.Object3D,
    data: TextObjectData,
  ): void {
    const id = object.uuid;
    this.objectDataMap.set(id, data);
  }

  /**
   * オブジェクトIDからデータを取得する
   */
  private getObjectData(object: THREE.Object3D): TextObjectData | undefined {
    return this.objectDataMap.get(object.uuid);
  }

  /**
   * テキストラインを作成
   */
  private createTextLines(): void {
    if (!this.font) {
      console.error("フォントがロードされていません");
      return;
    }

    // 既存のテキストを削除
    this.textGroups.forEach((group) => {
      this.objectDataMap.delete(group.uuid);
      this.scene.remove(group);
    });
    this.textGroups = [];

    // テキストラインを作成
    textLines.forEach((textLine) => {
      const group = new THREE.Group();
      group.position.set(textLine.entry.x, textLine.entry.y, 0);
      group.rotation.z = THREE.MathUtils.degToRad(textLine.entry.rot);

      // グループのデータを登録
      this.registerObjectData(group, {
        textLine,
        initialPosition: new THREE.Vector3(
          textLine.entry.x,
          textLine.entry.y,
          0,
        ),
        initialRotation: new THREE.Euler(
          0,
          0,
          THREE.MathUtils.degToRad(textLine.entry.rot),
        ),
      });

      // 文字間の間隔を計算
      const spacingX = 60;
      const chrArray = [...textLine.chrs];
      const chrNum = chrArray.length;
      const centeringX = (spacingX * (chrNum - 1)) / 2;

      // 各文字を作成
      chrArray.forEach((char, i) => {
        try {
          // 文字のスタイル
          const letterStyle = textLine.entry.chrs?.[i];
          const size = letterStyle?.size || DEFAULT_FONT_SIZE;

          // 文字の位置と回転を計算
          const x = spacingX * i - centeringX + (letterStyle?.x || 0);
          const y = letterStyle?.y || 0;
          const rot = letterStyle?.rot || 0;

          // 文字のジオメトリとマテリアルを作成
          const textGeometry = new TextGeometry(char, {
            font: this.font!,
            size: size,
            height: 1,
            curveSegments: 4,
            bevelEnabled: false,
          });

          // 文字をセンタリング
          textGeometry.computeBoundingBox();
          if (textGeometry.boundingBox) {
            const width =
              textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
            const height =
              textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;
            textGeometry.translate(-width / 2, -height / 2, 0);
          }

          const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
          const textMesh = new THREE.Mesh(textGeometry, material);

          // 位置と回転を設定
          textMesh.position.set(x, y, 0);
          textMesh.rotation.z = THREE.MathUtils.degToRad(rot);

          // メッシュのデータを登録
          this.registerObjectData(textMesh, {
            letterAnimParams: textLine.letterAnimParamsList[i],
            initialPosition: new THREE.Vector3(x, y, 0),
            initialRotation: new THREE.Euler(
              0,
              0,
              THREE.MathUtils.degToRad(rot),
            ),
          });

          group.add(textMesh);
        } catch (error) {
          console.error(`文字の作成中にエラーが発生しました: ${char}`, error);
        }
      });

      this.textGroups.push(group);
      this.scene.add(group);
    });
  }

  /**
   * アニメーションパラメータを適用
   */
  private applyAnimation(
    object: THREE.Object3D,
    t: number,
    param: AnimParam,
  ): void {
    if (param.easing === "none") return;

    const { x = 0, y = 0, rot = 0, rotX = 0, rotY = 0, easing } = param;

    const easedTime = easingFuncList[easing](t);

    // 位置のアニメーション
    object.position.x += x * easedTime;
    object.position.y += y * easedTime;

    // 回転のアニメーション
    if (rot !== 0) {
      // 回転軸の位置を保存
      const originalPosition = object.position.clone();

      // 回転軸に移動
      object.position.x += rotX;
      object.position.y += rotY;

      // Z軸周りに回転
      object.rotateZ(THREE.MathUtils.degToRad(rot * easedTime));

      // 回転軸から戻る
      object.position.x = originalPosition.x;
      object.position.y = originalPosition.y;
    }
  }

  /**
   * テキストラインのアニメーションを更新
   */
  private updateTextLines(): void {
    const t = this.elapsedTime / BEAT_TIME;

    this.textGroups.forEach((group) => {
      const objectData = this.getObjectData(group);
      if (!objectData || !objectData.textLine) return;

      const textLine = objectData.textLine;

      // 現在のステップを計算
      const step = Math.floor(t - textLine.entry.step);

      // このラインはまだ表示されない
      if (step < 0) {
        group.visible = false;
        return;
      }

      // 表示を有効にする
      group.visible = true;

      // 初期状態にリセット
      group.position.copy(objectData.initialPosition);
      group.rotation.copy(objectData.initialRotation);

      // 行全体のアニメーションを適用
      if (Array.isArray(textLine.lineAnimParams)) {
        textLine.lineAnimParams.forEach((param, i) => {
          if (i < step) {
            // 完了したステップのアニメーション
            this.applyAnimation(group, 1, param);
          } else if (i === step) {
            // 進行中のステップのアニメーション
            this.applyAnimation(group, t % 1, param);
          }
        });
      }

      // 各文字のアニメーションを適用
      group.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        const meshData = this.getObjectData(mesh);
        if (!meshData || !meshData.letterAnimParams) return;

        // 初期状態にリセット
        mesh.position.copy(meshData.initialPosition);
        mesh.rotation.copy(meshData.initialRotation);

        // 文字のアニメーションを適用
        const letterAnimParams = meshData.letterAnimParams;
        if (Array.isArray(letterAnimParams)) {
          letterAnimParams.forEach((param, i) => {
            if (i < step) {
              // 完了したステップのアニメーション
              this.applyAnimation(mesh, 1, param);
            } else if (i === step) {
              // 進行中のステップのアニメーション
              this.applyAnimation(mesh, t % 1, param);
            }
          });
        }
      });
    });
  }

  /**
   * アニメーションループ
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    // 時間の更新
    if (!this.isPaused) {
      const delta = this.clock.getDelta();
      this.elapsedTime += this.additionalTime * delta * this.timeFactor * 1000;
      if (this.elapsedTime < 0) this.elapsedTime = 0;
    }

    // 情報の更新
    const statusText = this.isPaused ? "一時停止中" : "再生中";
    const infoText = `経過時間: ${this.elapsedTime.toFixed(1)} / 状態: ${statusText}`;

    // 情報テキストの更新（既存の要素があれば削除）
    const existingStatusInfo = this.infoElement.querySelector(".status-info");
    if (existingStatusInfo) {
      existingStatusInfo.textContent = infoText;
    } else {
      const statusInfo = document.createElement("div");
      statusInfo.className = "status-info";
      statusInfo.textContent = infoText;

      if (this.infoElement.firstChild) {
        this.infoElement.insertBefore(statusInfo, this.infoElement.firstChild);
      } else {
        this.infoElement.appendChild(statusInfo);
      }
    }

    // テキストラインのアニメーションを更新
    this.updateTextLines();

    // レンダリング
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * ウィンドウリサイズ時の処理
   */
  private onWindowResize(): void {
    // 等角図法カメラのアスペクト比を維持
    const aspectRatio = window.innerWidth / window.innerHeight;
    const cameraHeight = HEIGHT;
    const cameraWidth = cameraHeight * aspectRatio;

    this.camera.left = -cameraWidth / 2;
    this.camera.right = cameraWidth / 2;
    this.camera.top = cameraHeight / 2;
    this.camera.bottom = -cameraHeight / 2;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * クリーンアップ
   */
  public dispose(): void {
    // イベントリスナーの削除
    window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    window.removeEventListener("keyup", this.handleKeyUp.bind(this));
    window.removeEventListener("resize", this.onWindowResize.bind(this));

    // データのクリーンアップ
    this.objectDataMap.clear();

    // Three.jsリソースの破棄
    this.textGroups.forEach((group) => {
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    });

    this.renderer.dispose();
  }
}

// インスタンスを作成して開始
let app: TearsOfOverflowedBits | null = null;
window.addEventListener("DOMContentLoaded", () => {
  try {
    app = new TearsOfOverflowedBits();
  } catch (error) {
    console.error("アプリケーションの初期化中にエラーが発生しました:", error);
    const container = document.getElementById("container");
    if (container) {
      const errorElement = document.createElement("div");
      errorElement.style.color = "red";
      errorElement.style.fontSize = "18px";
      errorElement.style.padding = "20px";
      errorElement.textContent = `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`;
      container.appendChild(errorElement);
    }
  }
});

// クリーンアップのためにunloadイベントを使用
window.addEventListener("unload", () => {
  if (app) {
    app.dispose();
    app = null;
  }
});
