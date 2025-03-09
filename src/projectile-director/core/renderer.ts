/**
 * Three.jsレンダリングに関するモジュール
 * シーン、カメラ、レンダラーの作成と管理を担当
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * レンダリングエンジンクラス
 * Three.jsのシーン、カメラ、レンダラーの初期化と管理を行う
 */
export class RenderingEngine {
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;

  // オブジェクト参照
  originMesh: THREE.Mesh;
  targetMesh: THREE.Mesh;
  predictionLine: THREE.Line;

  /**
   * コンストラクタ
   * Three.jsの基本オブジェクトを初期化
   */
  constructor() {
    // シーン作成
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);

    // カメラ作成
    this.camera = new THREE.OrthographicCamera(
      -window.innerWidth / 2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      -window.innerHeight / 2,
      0.1,
      1000,
    );
    this.camera.position.z = 10;

    // レンダラー作成
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // コントロール作成
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;

    // グリッド追加
    const gridHelper = new THREE.GridHelper(2000, 20, 0x444444, 0x444444);
    gridHelper.rotation.x = Math.PI / 2;
    this.scene.add(gridHelper);

    // 基本オブジェクト作成
    this.originMesh = this.createOrigin();
    this.targetMesh = this.createTarget(10);
    this.predictionLine = this.createPredictionLine();

    // ウィンドウリサイズイベントリスナー
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  /**
   * 原点（発射位置）を作成
   * @returns 作成されたメッシュ
   */
  private createOrigin(): THREE.Mesh {
    const originGeometry = new THREE.SphereGeometry(5, 32, 32);
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const originMesh = new THREE.Mesh(originGeometry, originMaterial);
    this.scene.add(originMesh);
    return originMesh;
  }

  /**
   * ターゲットを作成
   * @param size ターゲットのサイズ
   * @returns 作成されたメッシュ
   */
  private createTarget(size: number): THREE.Mesh {
    const targetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
    this.scene.add(targetMesh);
    return targetMesh;
  }

  /**
   * 予測線を作成
   * @returns 作成された線
   */
  private createPredictionLine(): THREE.Line {
    const predictionMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const predictionGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const predictionLine = new THREE.Line(
      predictionGeometry,
      predictionMaterial,
    );
    this.scene.add(predictionLine);
    return predictionLine;
  }

  /**
   * ターゲットサイズを更新
   * @param size 新しいサイズ
   */
  updateTargetSize(size: number): void {
    this.targetMesh.geometry.dispose();
    this.targetMesh.geometry = new THREE.SphereGeometry(size, 32, 32);
  }

  /**
   * 予測線を更新
   * @param startPoint 開始点
   * @param endPoint 終了点
   */
  updatePredictionLine(
    startPoint: THREE.Vector3,
    endPoint: THREE.Vector3,
  ): void {
    // NaN値をチェック
    if (
      isNaN(startPoint.x) ||
      isNaN(startPoint.y) ||
      isNaN(startPoint.z) ||
      isNaN(endPoint.x) ||
      isNaN(endPoint.y) ||
      isNaN(endPoint.z)
    ) {
      console.warn(
        "予測線の座標にNaN値が含まれています:",
        startPoint,
        endPoint,
      );
      return; // 不正な値の場合は更新しない
    }

    const points = [startPoint, endPoint];
    this.predictionLine.geometry.dispose();
    this.predictionLine.geometry = new THREE.BufferGeometry().setFromPoints(
      points,
    );
  }

  /**
   * ターゲット位置を更新
   * @param position 新しい位置
   */
  updateTargetPosition(position: THREE.Vector3): void {
    this.targetMesh.position.copy(position);
  }

  /**
   * ウィンドウリサイズ時の処理
   */
  private onWindowResize(): void {
    // 現在のズーム値を保持
    const currentZoom = this.camera.zoom;

    // カメラの視野範囲を調整
    this.camera.left = -window.innerWidth / 2;
    this.camera.right = window.innerWidth / 2;
    this.camera.top = window.innerHeight / 2;
    this.camera.bottom = -window.innerHeight / 2;

    // ズーム値を元に戻す（リサイズでリセットされるのを防ぐ）
    this.camera.zoom = currentZoom;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * 座標変換: スクリーン座標からワールド座標へ
   * ズーム倍率を考慮した正確な変換を行う
   * @param screenX スクリーンX座標
   * @param screenY スクリーンY座標
   * @returns 変換されたワールド座標
   */
  screenToWorld(screenX: number, screenY: number): THREE.Vector3 {
    // ワールド空間でのビューポートサイズ計算
    const viewportWidth =
      (this.camera.right - this.camera.left) / this.camera.zoom;
    const viewportHeight =
      (this.camera.top - this.camera.bottom) / this.camera.zoom;

    // 正規化されたデバイス座標（-1〜1の範囲）に変換
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;

    // NDC座標をワールド座標に変換
    const worldX = (ndcX * viewportWidth) / 2 + this.camera.position.x;
    const worldY = (ndcY * viewportHeight) / 2 + this.camera.position.y;

    return new THREE.Vector3(worldX, worldY, 0);
  }

  /**
   * レンダリング実行
   */
  render(): void {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    // レンダラーの破棄
    this.renderer.dispose();

    // ジオメトリとマテリアルの破棄
    this.originMesh.geometry.dispose();
    (this.originMesh.material as THREE.Material).dispose();

    this.targetMesh.geometry.dispose();
    (this.targetMesh.material as THREE.Material).dispose();

    this.predictionLine.geometry.dispose();
    (this.predictionLine.material as THREE.Material).dispose();

    // イベントリスナーの削除
    window.removeEventListener("resize", this.onWindowResize.bind(this));
  }

  /**
   * カメラの位置を取得
   * @returns カメラ位置
   */
  getCameraPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  /**
   * カメラのズーム倍率を取得
   * @returns ズーム倍率
   */
  getZoom(): number {
    return this.camera.zoom;
  }

  /**
   * カメラのズーム倍率を設定
   * @param zoom 新しいズーム倍率
   */
  setZoom(zoom: number): void {
    // 最小・最大ズーム範囲を制限
    const clampedZoom = Math.max(0.1, Math.min(zoom, 10));
    this.camera.zoom = clampedZoom;
    this.camera.updateProjectionMatrix();
  }

  /**
   * カメラの位置を設定
   * @param position 新しい位置
   */
  setCameraPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.camera.updateProjectionMatrix();
  }

  /**
   * コントロールの更新が必要かどうか
   * @returns 更新が必要ならtrue
   */
  needsUpdate(): boolean {
    return this.controls.enabled;
  }
}
