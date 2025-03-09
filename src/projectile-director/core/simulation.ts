/**
 * シミュレーション制御に関するモジュール
 * シミュレーションのメインロジックと統合を担当
 */

import * as THREE from "three";

import { ProjectileManager } from "./projectile";
import { RenderingEngine } from "./renderer";
import { defaultSimulationSettings } from "./settings";
import { InputController } from "../input/controls";
import { UIInterface } from "../ui/interface";
import { createVelocityFilter } from "../utils/filters";
import {
  calculateLeadAngle,
  calculateTimeToTarget,
} from "../utils/projectileCalculator";

import type { SimulationSettings } from "./settings";
import type { VelocityFilter } from "../utils/filters";

/**
 * シミュレーション管理クラス
 * 全体のシミュレーションを制御
 */
export class SimulationController {
  private renderingEngine: RenderingEngine;
  private projectileManager: ProjectileManager;
  private inputController: InputController;
  private uiInterface: UIInterface;

  private settings: SimulationSettings;
  private velocityFilter: VelocityFilter;

  private lastTime: number = 0;
  private hitCount: number = 0;
  private shotCount: number = 0;

  /**
   * コンストラクタ
   */
  constructor() {
    // 初期設定
    this.settings = { ...defaultSimulationSettings };

    // コンポーネント初期化
    this.renderingEngine = new RenderingEngine();
    this.projectileManager = new ProjectileManager(this.renderingEngine.scene);
    this.inputController = new InputController(this.renderingEngine);
    this.uiInterface = new UIInterface(this.settings);

    // 速度フィルター作成
    this.velocityFilter = createVelocityFilter(this.settings);

    // イベントハンドラ設定
    this.inputController.setFireCallback(this.fireProjectile.bind(this));
    this.uiInterface.setSettingsChangeCallback(
      this.onSettingsChange.bind(this),
    );

    // アニメーション開始
    this.lastTime = performance.now();
    this.animate();
  }

  /**
   * 設定変更イベントハンドラ
   * @param newSettings 新しい設定
   */
  private onSettingsChange(newSettings: SimulationSettings): void {
    this.settings = { ...this.settings, ...newSettings };

    // ターゲットのサイズを更新
    this.renderingEngine.updateTargetSize(this.settings.targetSize);

    // フィルターを再作成
    this.velocityFilter = createVelocityFilter(this.settings);
  }

  /**
   * 発射体を発射
   */
  private fireProjectile(): void {
    const targetPosition = this.inputController.getTargetPosition();
    const targetVelocity = this.inputController.getTargetVelocity();

    // リード角計算
    const leadAngle = calculateLeadAngle(
      { x: targetPosition.x, y: targetPosition.y },
      { x: targetVelocity.x, y: targetVelocity.y },
      this.settings.projectileSpeed,
    );

    // 発射方向の計算
    const targetAngle = Math.atan2(targetPosition.y, targetPosition.x);
    const fireAngle = targetAngle + leadAngle;

    // 速度ベクトルの計算
    const vx = this.settings.projectileSpeed * Math.cos(fireAngle);
    const vy = this.settings.projectileSpeed * Math.sin(fireAngle);

    // 発射体作成
    this.projectileManager.createProjectile(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(vx, vy, 0),
    );

    // 発射カウントを更新
    this.shotCount++;
    this.uiInterface.updateHitRate(this.hitCount, this.shotCount);
  }

  /**
   * 予測線の更新
   */
  private updatePredictionLine(): void {
    const targetPosition = this.inputController.getTargetPosition();
    const targetVelocity = this.inputController.getTargetVelocity();

    // NaN値のチェック
    if (
      isNaN(targetPosition.x) ||
      isNaN(targetPosition.y) ||
      isNaN(targetVelocity.x) ||
      isNaN(targetVelocity.y)
    ) {
      console.warn(
        "ターゲット位置または速度にNaN値が含まれています:",
        targetPosition,
        targetVelocity,
      );
      return; // 不正な値の場合は更新しない
    }

    // リード角計算
    const leadAngle = calculateLeadAngle(
      { x: targetPosition.x, y: targetPosition.y },
      { x: targetVelocity.x, y: targetVelocity.y },
      this.settings.projectileSpeed,
    );

    // 到達時間計算
    const timeToTarget = calculateTimeToTarget(
      { x: targetPosition.x, y: targetPosition.y },
      { x: targetVelocity.x, y: targetVelocity.y },
      this.settings.projectileSpeed,
    );

    // NaN値のチェック
    if (isNaN(leadAngle) || isNaN(timeToTarget)) {
      console.warn(
        "リード角または到達時間の計算結果にNaN値が含まれています:",
        leadAngle,
        timeToTarget,
      );
      return; // 不正な値の場合は更新しない
    }

    // 目標までの角度
    const localTargetAngle = Math.atan2(targetPosition.y, targetPosition.x);

    // 発射角度（リード角を加算）
    const fireAngle = localTargetAngle + leadAngle;

    // 予測線の終点
    const lineLength = this.settings.predictionLineLength;
    const endX = lineLength * Math.cos(fireAngle);
    const endY = lineLength * Math.sin(fireAngle);

    // 予測線の更新
    this.renderingEngine.updatePredictionLine(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(endX, endY, 0),
    );

    // タイムトゥターゲット表示更新
    this.uiInterface.updateTimeToTarget(timeToTarget);
  }

  /**
   * アニメーションループ
   */
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // 秒単位に変換
    this.lastTime = currentTime;

    // ターゲット位置の更新
    const targetInfo = this.inputController.updateTargetPosition(
      this.settings,
      deltaTime,
      this.velocityFilter,
    );

    // UI情報の更新
    this.uiInterface.updateInfoDisplay(
      targetInfo.position,
      targetInfo.velocity,
    );

    // 発射体の更新
    const newHits = this.projectileManager.update(
      deltaTime,
      targetInfo.position,
      this.settings.targetSize,
    );

    // ヒットカウント更新
    if (newHits > 0) {
      this.hitCount += newHits;
      this.uiInterface.updateHitRate(this.hitCount, this.shotCount);
    }

    // 予測線の更新
    this.updatePredictionLine();

    // レンダリング
    this.renderingEngine.render();
  }
}
