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

/**
 * シンプルにテキストを表示するThree.jsの実装
 * 「tears of overflowed bits」のシンプル版
 */
class SimpleTextRenderer {
  // Three.jsの基本コンポーネント
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // フォント情報とメッシュオブジェクト
  private font?: Font; // THREE.Fontではなく、FontLoaderのFontを使う
  private textMesh?: THREE.Mesh;

  // アニメーション用の時間管理
  private clock = new THREE.Clock();

  // DOM要素
  private logElement: HTMLElement;
  private container: HTMLElement;

  /**
   * コンストラクタ - 初期化処理を行う
   */
  constructor() {
    // DOMエレメントの取得
    const container = document.getElementById(CONTAINER_ID);
    const logElement = document.getElementById(LOG_ID);

    if (!container || !logElement) {
      throw new Error("DOM要素の取得に失敗しました");
    }

    this.container = container;
    this.logElement = logElement;

    // レンダラーの初期化
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000); // 黒い背景

    // シーンの初期化
    this.scene = new THREE.Scene();

    // カメラの初期化 (視野角, アスペクト比, 手前のクリップ面, 奥のクリップ面)
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.camera.position.z = 5; // カメラを手前に移動

    // ライトの追加
    this.addLights();

    // コンテナにレンダラーのcanvas要素を追加
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
      console.warn(
        "コンテナ要素が見つかりませんでした。body直下に追加します。",
      );
    }

    // ウィンドウリサイズイベントの登録
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // フォントのロード
    this.loadFont();
  }

  /**
   * エラーメッセージを表示する
   */
  private showError(message: string, error: unknown): void {
    // this.logElement.style.display = "block";
    this.logElement.innerHTML = `
        ${message}<br>
        <small>${error instanceof Error ? error.message : String(error)}</small>
      `;
    this.logElement.style.color = "#ff4444";
  }

  /**
   * シーンにライトを追加するメソッド
   */
  private addLights(): void {
    // 環境光（全体を均等に照らす）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // 指向性ライト（太陽光のような方向性のある光）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1); // 右上奥から照らす
    this.scene.add(directionalLight);
  }

  /**
   * フォントローダーを使用してフォントをロードするメソッド
   */
  private loadFont(): void {
    // ローディングテキストの表示
    if (this.logElement) {
      this.logElement.innerHTML = "フォントをロード中...";
    }

    // FontLoaderの初期化
    const loader = new FontLoader();

    loader.load(
      FONT_PATH,
      // ロード成功時のコールバック
      (font) => {
        this.font = font;

        // ローディング表示を非表示にする
        if (this.logElement) {
          this.logElement.style.display = "none";
        }

        console.info("フォントロード成功:", font);

        // テキストの作成
        this.createText();
        // アニメーション開始
        this.animate();
      },
      // ロード進捗時のコールバック
      (xhr) => {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        if (this.logElement) {
          this.logElement.innerHTML = `フォントをロード中 (${FONT_PATH}): ${Math.round(percentComplete)}%`;
        }
      },
      // ロードエラー時のコールバック
      (error: unknown) => {
        console.warn(`${FONT_PATH} からのフォントロードに失敗しました:`, error);
        this.showError("フォントのロードに失敗しました", error);
      },
    );
  }

  /**
   * 3Dテキストを作成してシーンに追加するメソッド
   */
  private createText(): void {
    if (!this.font) {
      console.error("フォントがロードされていません");
      return;
    }

    try {
      // テキストのジオメトリを作成
      const textGeometry = new TextGeometry("こんにちは、Three.js!", {
        font: this.font,
        size: 1, // テキストのサイズ
        depth: 0.1, // テキストの厚み（奥行き）
        curveSegments: 4, // 曲線の品質（値が大きいほど滑らか）
        bevelEnabled: false, // ベベル（角の丸み）を有効化
        // bevelThickness: 0.03, // ベベルの厚み
        // bevelSize: 0.02, // ベベルのサイズ
        // bevelSegments: 5, // ベベルの品質
      });

      // テキストのバウンディングボックス（境界箱）を計算
      textGeometry.computeBoundingBox();

      // テキストを中央に配置
      if (textGeometry.boundingBox) {
        const centerOffsetX =
          -(textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x) /
          2;
        const centerOffsetY =
          -(textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y) /
          2;
        textGeometry.translate(centerOffsetX, centerOffsetY, 0);
      }

      // マテリアルを作成（見た目の設定）
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

      // テキストメッシュを作成（ジオメトリ + マテリアル）
      this.textMesh = new THREE.Mesh(textGeometry, material);

      // シーンにテキストメッシュを追加
      this.scene.add(this.textMesh);

      // ステータス表示の追加
      this.addStatusInfo();
    } catch (error) {
      console.error("テキスト作成中にエラーが発生しました:", error);
      this.showError("テキスト作成中にエラーが発生しました", error);
    }
  }

  /**
   * 操作方法などの情報要素を画面に追加
   */
  private addStatusInfo(): void {
    const instructionsDiv = document.createElement("div");
    instructionsDiv.className = "instructions";
    instructionsDiv.innerHTML = `
      <p>【操作方法】</p>
      <p>回転するテキストをシンプルに表示しています</p>
      <p>ブラウザをリサイズするとカメラが自動調整されます</p>
    `;
    document.body.appendChild(instructionsDiv);
  }

  /**
   * ウィンドウリサイズ時のイベントハンドラ
   */
  private onWindowResize(): void {
    // カメラのアスペクト比を更新
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    // レンダラーのサイズを更新
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * アニメーションループ
   */
  private animate(): void {
    // 次のフレームでもanimate関数を呼び出す
    requestAnimationFrame(this.animate.bind(this));

    // 経過時間を取得
    const delta = this.clock.getDelta();

    // テキストの回転アニメーション
    if (this.textMesh) {
      // Y軸を中心にゆっくり回転
      this.textMesh.rotation.y += 0.5 * delta;
      // X軸を中心に少しだけ回転
      this.textMesh.rotation.x =
        Math.sin(this.clock.getElapsedTime() * 0.5) * 0.2;
    }

    // シーンをレンダリング
    this.renderer.render(this.scene, this.camera);
  }
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", () => {
  // インスタンス作成（コンストラクタが呼ばれる）
  new SimpleTextRenderer();
});
