/**
 * 発射体指揮装置シミュレーター
 * Three.jsを使用した発射体シミュレーションのエントリーポイント
 *
 * TODO: これは自動生成されたコードで思うように動作しない。
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ドメインロジックとユーティリティのインポート`
import { SimulationController } from "./core/simulation";
import { createVelocityFilter } from "./utils/filters";
import {
  calculateLeadAngle,
  calculateTimeToTarget,
} from "./utils/projectileCalculator";

import type { VelocityFilter } from "./utils/filters";

// FilterType型をインポート
type FilterType =
  | "none"
  | "movingAverage"
  | "singleExponential"
  | "doubleExponential"
  | "kalmanFilter"
  | "oneEuroFilter";

// TargetMotionType型をインポート
type TargetMotionType = "mouse" | "linearConstant" | "circularConstant";

// シミュレーション設定の初期値
interface SimulationSettings {
  projectileSpeed: number;
  targetSize: number;
  predictionLineLength: number;
  velocityFilterLength: number;
  filterType: FilterType;
  targetMotion: {
    type: TargetMotionType;
    centerX: number;
    centerY: number;
    linearSpeed: number;
    linearLength: number;
    circularRadius: number;
    circularSpeed: number;
  };
  filterParams: {
    singleExponentialAlpha: number;
    doubleExponentialAlpha: number;
    doubleExponentialBeta: number;
    kalmanProcessNoise: number;
    kalmanMeasurementNoise: number;
    oneEuroMinCutoff: number;
    oneEuroBeta: number;
    oneEuroDcutoff: number;
  };
}

const DEFAULT_SIMULATION_SETTINGS: SimulationSettings = {
  projectileSpeed: 200,
  targetSize: 10,
  predictionLineLength: 100,
  velocityFilterLength: 5,
  filterType: "none", // デフォルトはフィルターなし
  targetMotion: {
    type: "mouse", // デフォルトはマウス操作
    centerX: 0,
    centerY: 0,
    linearSpeed: 200, // 200px/秒
    linearLength: 300, // 300px
    circularRadius: 150, // 150px
    circularSpeed: 1.0, // 1.0ラジアン/秒 (約0.16Hz)
  },
  filterParams: {
    // 単純指数平滑化
    singleExponentialAlpha: 0.2,
    // 二重指数平滑化
    doubleExponentialAlpha: 0.2,
    doubleExponentialBeta: 0.1,
    // カルマンフィルター
    kalmanProcessNoise: 0.01,
    kalmanMeasurementNoise: 0.1,
    // One-Euro フィルター
    oneEuroMinCutoff: 1.0,
    oneEuroBeta: 0.007,
    oneEuroDcutoff: 1.0,
  },
};

const simulationSettings: SimulationSettings = DEFAULT_SIMULATION_SETTINGS;

// 統計情報
let hitCount = 0;
let shotCount = 0;

// DOM要素への参照
const targetPositionEl = document.getElementById(
  "target-position",
) as HTMLElement;
const targetVelocityEl = document.getElementById(
  "target-velocity",
) as HTMLElement;
const projectileSpeedEl = document.getElementById(
  "projectile-speed",
) as HTMLElement;
const timeToTargetEl = document.getElementById("time-to-target") as HTMLElement;
const hitRateEl = document.getElementById("hit-rate") as HTMLElement;

// 設定要素への参照
const projectileSpeedInput = document.getElementById(
  "projectile-speed-input",
) as HTMLInputElement;
const targetSizeInput = document.getElementById(
  "target-size-input",
) as HTMLInputElement;
const filterTypeSelect = document.getElementById(
  "filter-type",
) as HTMLSelectElement;
const targetMotionTypeSelect = document.getElementById(
  "target-motion-type",
) as HTMLSelectElement;

// Three.jsのセットアップ
let scene: THREE.Scene;
let camera: THREE.OrthographicCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let targetMesh: THREE.Mesh;
let originMesh: THREE.Mesh;
let predictionLine: THREE.Line;
let velocityFilter: VelocityFilter;
let projectiles: Projectile[] = [];

// 発射体の型定義
class Projectile {
  position: THREE.Vector3;
  previousPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  createdAt: number;
  hit: boolean;
  mesh: THREE.Mesh | null;
  trail: THREE.Line | null;

  constructor(
    position: THREE.Vector3,
    velocity: THREE.Vector3,
    createdAt: number,
  ) {
    this.position = position.clone();
    this.previousPosition = position.clone();
    this.velocity = velocity.clone();
    this.createdAt = createdAt;
    this.hit = false;

    // Three.jsオブジェクト
    this.mesh = null;
    this.trail = null;
  }
}

// 座標変換ヘルパー
function screenToWorld(screenX: number, screenY: number): THREE.Vector3 {
  // キャンバスの位置を取得（offsetはDOMのオフセットを考慮）
  const canvasBounds = renderer.domElement.getBoundingClientRect();

  // キャンバス上での相対位置（0～1）を計算
  const normalizedX = (screenX - canvasBounds.left) / canvasBounds.width;
  const normalizedY = (screenY - canvasBounds.top) / canvasBounds.height;

  // 正規化座標（-1～1）に変換
  const ndcX = normalizedX * 2 - 1;
  const ndcY = -(normalizedY * 2 - 1);

  // 正規化座標をワールド座標に変換
  // const vector = new THREE.Vector3(ndcX, ndcY, 0);
  const vector = new THREE.Vector3(ndcX, ndcY, 0);

  // カメラの投影行列と視点行列を使用して変換
  vector.unproject(camera);

  // カメラからの方向ベクトルを計算
  const dir = vector.sub(camera.position).normalize();

  // Z=0平面との交点を計算
  const distance = -camera.position.z / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}

function _worldToScreen(
  worldX: number,
  worldY: number,
  worldZ = 0,
): { x: number; y: number } {
  const vector = new THREE.Vector3(worldX, worldY, worldZ);
  vector.project(camera);

  return {
    x: ((vector.x + 1) / 2) * window.innerWidth,
    y: (-(vector.y - 1) / 2) * window.innerHeight,
  };
}

// シミュレーションの初期化
function init(): void {
  // シーン作成
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x333333);

  // カメラ作成
  camera = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    0.1,
    1000,
  );
  camera.position.z = 10;

  // レンダラー作成
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // OrbitControlsを初期化
  initControls();

  // グリッド追加
  const gridHelper = new THREE.GridHelper(2000, 20, 0x444444, 0x444444);
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);

  // 原点（発射位置）
  const originGeometry = new THREE.SphereGeometry(5, 32, 32);
  const originMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  originMesh = new THREE.Mesh(originGeometry, originMaterial);
  scene.add(originMesh);

  // ターゲット
  const targetGeometry = new THREE.SphereGeometry(
    simulationSettings.targetSize,
    32,
    32,
  );
  const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
  scene.add(targetMesh);

  // 予測線
  const predictionMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const predictionGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  predictionLine = new THREE.Line(predictionGeometry, predictionMaterial);
  scene.add(predictionLine);

  // イベントリスナー設定
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("click", onMouseClick);
  projectileSpeedInput.addEventListener("input", onSettingsChange);
  targetSizeInput.addEventListener("input", onSettingsChange);
  filterTypeSelect.addEventListener("change", onSettingsChange);
  targetMotionTypeSelect.addEventListener("change", onSettingsChange);

  // 速度フィルター作成
  velocityFilter = createVelocityFilter(simulationSettings);

  // アニメーションスタート
  animate();
}

// ウィンドウリサイズ時の処理
function onWindowResize(): void {
  // キャンバスのサイズを更新
  renderer.setSize(window.innerWidth, window.innerHeight);

  // カメラの視野を更新
  camera.left = -window.innerWidth / 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = -window.innerHeight / 2;
  camera.updateProjectionMatrix();

  // OrbitControlsを更新
  controls.update();
}

// 変数初期化
const lastPosition = new THREE.Vector2(0, 0);
const currentMousePosition = new THREE.Vector2(0, 0);
let lastTime = performance.now();
const targetPosition = new THREE.Vector2(0, 0);
const targetVelocity = new THREE.Vector2(0, 0);
let targetAngle = 0;

// マウス移動時の処理
function onMouseMove(event: MouseEvent): void {
  if (simulationSettings.targetMotion.type === "mouse") {
    const worldPos = screenToWorld(event.clientX, event.clientY);
    currentMousePosition.set(worldPos.x, worldPos.y);
  }
}

// マウスクリック時の処理（発射体発射）
function onMouseClick(): void {
  fireProjectile();
}

// 設定変更時の処理
function onSettingsChange(): void {
  simulationSettings.projectileSpeed = parseInt(projectileSpeedInput.value);
  simulationSettings.targetSize = parseInt(targetSizeInput.value);
  simulationSettings.filterType = filterTypeSelect.value as FilterType;
  simulationSettings.targetMotion.type =
    targetMotionTypeSelect.value as TargetMotionType;

  // 目標のサイズを更新
  targetMesh.geometry.dispose();
  targetMesh.geometry = new THREE.SphereGeometry(
    simulationSettings.targetSize,
    32,
    32,
  );

  // フィルターを再作成
  velocityFilter = createVelocityFilter(simulationSettings);

  // UI更新
  projectileSpeedEl.textContent = `${simulationSettings.projectileSpeed} px/s`;
}

// 発射体発射処理
function fireProjectile(): void {
  // リード角計算
  const leadAngle = calculateLeadAngle(
    { x: targetPosition.x, y: targetPosition.y },
    { x: targetVelocity.x, y: targetVelocity.y },
    simulationSettings.projectileSpeed,
  );

  // 発射方向の計算
  const targetAngle = Math.atan2(targetPosition.y, targetPosition.x);
  const fireAngle = targetAngle + leadAngle;

  // 速度ベクトルの計算
  const vx = simulationSettings.projectileSpeed * Math.cos(fireAngle);
  const vy = simulationSettings.projectileSpeed * Math.sin(fireAngle);

  // 発射体作成
  const projectile = new Projectile(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(vx, vy, 0),
    performance.now(),
  );

  // メッシュ作成
  const projectileGeometry = new THREE.SphereGeometry(3, 8, 8);
  const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
  projectile.mesh = new THREE.Mesh(projectileGeometry, projectileMaterial);
  scene.add(projectile.mesh);

  // 軌跡用の線
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0x0088ff });
  const trailGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  projectile.trail = new THREE.Line(trailGeometry, trailMaterial);
  scene.add(projectile.trail);

  // 発射体リストに追加
  projectiles.push(projectile);
  shotCount++;
  updateHitRate();
}

// 命中率の更新
function updateHitRate(): void {
  const rate = shotCount > 0 ? ((hitCount / shotCount) * 100).toFixed(1) : "0";
  hitRateEl.textContent = `${hitCount}/${shotCount} (${rate}%)`;
}

// アニメーションループ
function animate(): void {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const deltaTime = (currentTime - lastTime) / 1000; // 秒単位に変換
  lastTime = currentTime;

  // ターゲット位置の更新
  updateTargetPosition(deltaTime);

  // 発射体の更新
  updateProjectiles(deltaTime);

  // 予測線の更新
  updatePredictionLine();

  // UI情報の更新
  updateInfoUI();

  // レンダリング
  renderer.render(scene, camera);

  // OrbitControlsの更新
  controls.update();
}

// ターゲット位置の更新
function updateTargetPosition(deltaTime: number): void {
  const newPosition = new THREE.Vector2();

  switch (simulationSettings.targetMotion.type) {
    case "mouse":
      newPosition.copy(currentMousePosition);
      break;

    case "linearConstant":
      targetAngle +=
        (simulationSettings.targetMotion.linearSpeed * deltaTime) /
        simulationSettings.targetMotion.linearLength;
      if (targetAngle > 1) targetAngle = -1;
      newPosition.x =
        simulationSettings.targetMotion.centerX +
        targetAngle * simulationSettings.targetMotion.linearLength;
      newPosition.y = simulationSettings.targetMotion.centerY;
      break;

    case "circularConstant":
      targetAngle += simulationSettings.targetMotion.circularSpeed * deltaTime;
      newPosition.x =
        simulationSettings.targetMotion.centerX +
        Math.cos(targetAngle) * simulationSettings.targetMotion.circularRadius;
      newPosition.y =
        simulationSettings.targetMotion.centerY +
        Math.sin(targetAngle) * simulationSettings.targetMotion.circularRadius;
      break;
  }

  // 速度計算（位置の差分から）
  const rawVelocity = new THREE.Vector2()
    .copy(newPosition)
    .sub(lastPosition)
    .divideScalar(deltaTime);

  // 速度フィルター適用
  const filteredVelocity = velocityFilter.filter({
    x: rawVelocity.x,
    y: rawVelocity.y,
  });

  // 値の更新
  targetVelocity.x = filteredVelocity.x;
  targetVelocity.y = filteredVelocity.y;
  targetPosition.copy(newPosition);
  lastPosition.copy(newPosition);

  // メッシュ位置更新
  targetMesh.position.set(targetPosition.x, targetPosition.y, 0);
}

// 発射体の更新
function updateProjectiles(deltaTime: number): void {
  // 発射体を更新し、削除すべきものを識別する
  projectiles = projectiles.filter((projectile, _index) => {
    if (!projectile) return false;

    // 前の位置を保存
    projectile.previousPosition.copy(projectile.position);

    // 新しい位置を計算
    projectile.position.x += projectile.velocity.x * deltaTime;
    projectile.position.y += projectile.velocity.y * deltaTime;

    // メッシュの位置更新
    if (projectile.mesh) {
      projectile.mesh.position.set(
        projectile.position.x,
        projectile.position.y,
        0,
      );
    }

    // 軌跡の更新
    if (projectile.trail) {
      const trailPoints = [
        new THREE.Vector3(
          projectile.previousPosition.x,
          projectile.previousPosition.y,
          0,
        ),
        new THREE.Vector3(projectile.position.x, projectile.position.y, 0),
      ];
      projectile.trail.geometry.dispose();
      projectile.trail.geometry = new THREE.BufferGeometry().setFromPoints(
        trailPoints,
      );
    }

    // 当たり判定
    if (!projectile.hit) {
      const distance = new THREE.Vector2(
        projectile.position.x - targetPosition.x,
        projectile.position.y - targetPosition.y,
      ).length();

      if (distance < simulationSettings.targetSize) {
        projectile.hit = true;
        hitCount++;
        updateHitRate();
      }
    }

    // 画面外に出たかチェック
    const isOutOfBounds =
      Math.abs(projectile.position.x) > window.innerWidth ||
      Math.abs(projectile.position.y) > window.innerHeight ||
      performance.now() - projectile.createdAt > 10000; // タイムアウト (10秒)

    // 画面外に出た場合はThree.jsオブジェクトを削除してから配列から削除
    if (isOutOfBounds) {
      // Three.jsオブジェクトの削除
      if (projectile.mesh) {
        scene.remove(projectile.mesh);
        projectile.mesh.geometry.dispose();
      }

      if (projectile.trail) {
        scene.remove(projectile.trail);
        projectile.trail.geometry.dispose();
      }

      return false; // 配列から削除
    }

    return true; // 配列に保持
  });
}

// 予測線の更新
function updatePredictionLine(): void {
  // リード角計算
  const leadAngle = calculateLeadAngle(
    { x: targetPosition.x, y: targetPosition.y },
    { x: targetVelocity.x, y: targetVelocity.y },
    simulationSettings.projectileSpeed,
  );

  // 到達時間計算
  const timeToTarget = calculateTimeToTarget(
    { x: targetPosition.x, y: targetPosition.y },
    { x: targetVelocity.x, y: targetVelocity.y },
    simulationSettings.projectileSpeed,
  );

  // 目標までの角度
  const localTargetAngle = Math.atan2(targetPosition.y, targetPosition.x);

  // 発射角度（リード角を加算）
  const fireAngle = localTargetAngle + leadAngle;

  // 予測線の終点
  const lineLength = simulationSettings.predictionLineLength;
  const endX = lineLength * Math.cos(fireAngle);
  const endY = lineLength * Math.sin(fireAngle);

  // 予測線の更新
  const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(endX, endY, 0)];
  predictionLine.geometry.dispose();
  predictionLine.geometry = new THREE.BufferGeometry().setFromPoints(points);

  // タイムトゥターゲット表示更新
  timeToTargetEl.textContent = timeToTarget.toFixed(2) + " 秒";
}

// UI情報の更新
function updateInfoUI(): void {
  targetPositionEl.textContent = `X: ${targetPosition.x.toFixed(0)}, Y: ${targetPosition.y.toFixed(0)}`;
  targetVelocityEl.textContent = `X: ${targetVelocity.x.toFixed(1)}, Y: ${targetVelocity.y.toFixed(1)}`;
  projectileSpeedEl.textContent = `${simulationSettings.projectileSpeed} px/s`;
}

// OrbitControlsの変更イベントリスナーを追加
function initControls(): void {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableRotate = false;
  controls.enablePan = true;
  controls.enableZoom = true;
}

// 初期化実行
init();

// シミュレーションの初期化
const simulationController = new SimulationController();

// デバッグ目的でグローバル変数として公開
(
  window as unknown as {
    simulationController: SimulationController | undefined;
  }
).simulationController = simulationController;
