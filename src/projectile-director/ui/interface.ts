/**
 * UIインターフェースに関するモジュール
 * DOMの操作とUIイベントの処理を担当
 */

import type {
  SimulationSettings,
  FilterType,
  TargetMotionType,
} from "../core/settings";
import type * as THREE from "three";

/**
 * UIインターフェースクラス
 * DOM要素の参照と操作を管理
 */
export class UIInterface {
  // DOM要素への参照
  private targetPositionEl: HTMLElement;
  private targetVelocityEl: HTMLElement;
  private projectileSpeedEl: HTMLElement;
  private timeToTargetEl: HTMLElement;
  private hitRateEl: HTMLElement;

  // 設定要素への参照
  private projectileSpeedInput: HTMLInputElement;
  private targetSizeInput: HTMLInputElement;
  private filterTypeSelect: HTMLSelectElement;
  private targetMotionTypeSelect: HTMLSelectElement;

  // 設定変更コールバック
  private settingsChangeCallback:
    | ((settings: SimulationSettings) => void)
    | null = null;

  /**
   * コンストラクタ
   * @param initialSettings 初期設定
   */
  constructor(initialSettings: SimulationSettings) {
    // DOM要素の取得
    this.targetPositionEl = document.getElementById(
      "target-position",
    ) as HTMLElement;
    this.targetVelocityEl = document.getElementById(
      "target-velocity",
    ) as HTMLElement;
    this.projectileSpeedEl = document.getElementById(
      "projectile-speed",
    ) as HTMLElement;
    this.timeToTargetEl = document.getElementById(
      "time-to-target",
    ) as HTMLElement;
    this.hitRateEl = document.getElementById("hit-rate") as HTMLElement;

    // 設定要素の取得
    this.projectileSpeedInput = document.getElementById(
      "projectile-speed-input",
    ) as HTMLInputElement;
    this.targetSizeInput = document.getElementById(
      "target-size-input",
    ) as HTMLInputElement;
    this.filterTypeSelect = document.getElementById(
      "filter-type",
    ) as HTMLSelectElement;
    this.targetMotionTypeSelect = document.getElementById(
      "target-motion-type",
    ) as HTMLSelectElement;

    // 初期値を設定
    this.projectileSpeedInput.value =
      initialSettings.projectileSpeed.toString();
    this.targetSizeInput.value = initialSettings.targetSize.toString();
    this.filterTypeSelect.value = initialSettings.filterType;
    this.targetMotionTypeSelect.value = initialSettings.targetMotion.type;

    // イベントリスナーの設定
    this.projectileSpeedInput.addEventListener(
      "input",
      this.onSettingsChange.bind(this),
    );
    this.targetSizeInput.addEventListener(
      "input",
      this.onSettingsChange.bind(this),
    );
    this.filterTypeSelect.addEventListener(
      "change",
      this.onSettingsChange.bind(this),
    );
    this.targetMotionTypeSelect.addEventListener(
      "change",
      this.onSettingsChange.bind(this),
    );
  }

  /**
   * 設定変更イベントハンドラ
   */
  private onSettingsChange(): void {
    if (this.settingsChangeCallback) {
      const settings: SimulationSettings = {
        projectileSpeed: parseInt(this.projectileSpeedInput.value),
        targetSize: parseInt(this.targetSizeInput.value),
        predictionLineLength: 100, // 固定値、必要に応じて設定可能に
        velocityFilterLength: 5, // 固定値、必要に応じて設定可能に
        filterType: this.filterTypeSelect.value as FilterType,
        targetMotion: {
          type: this.targetMotionTypeSelect.value as TargetMotionType,
          centerX: 0, // 固定値、必要に応じて設定可能に
          centerY: 0, // 固定値、必要に応じて設定可能に
          linearSpeed: 200, // 固定値、必要に応じて設定可能に
          linearLength: 300, // 固定値、必要に応じて設定可能に
          circularRadius: 150, // 固定値、必要に応じて設定可能に
          circularSpeed: 1.0, // 固定値、必要に応じて設定可能に
        },
        filterParams: {
          singleExponentialAlpha: 0.2, // 固定値、必要に応じて設定可能に
          doubleExponentialAlpha: 0.2, // 固定値、必要に応じて設定可能に
          doubleExponentialBeta: 0.1, // 固定値、必要に応じて設定可能に
          kalmanProcessNoise: 0.01, // 固定値、必要に応じて設定可能に
          kalmanMeasurementNoise: 0.1, // 固定値、必要に応じて設定可能に
          oneEuroMinCutoff: 1.0, // 固定値、必要に応じて設定可能に
          oneEuroBeta: 0.007, // 固定値、必要に応じて設定可能に
          oneEuroDcutoff: 1.0, // 固定値、必要に応じて設定可能に
        },
      };

      this.settingsChangeCallback(settings);
    }

    // UI更新
    this.projectileSpeedEl.textContent = `${this.projectileSpeedInput.value} px/s`;
  }

  /**
   * 設定変更コールバックを設定
   * @param callback 設定変更時に呼び出される関数
   */
  setSettingsChangeCallback(
    callback: (settings: SimulationSettings) => void,
  ): void {
    this.settingsChangeCallback = callback;
  }

  /**
   * 情報表示を更新
   * @param targetPosition ターゲット位置
   * @param targetVelocity ターゲット速度
   */
  updateInfoDisplay(
    targetPosition: THREE.Vector2,
    targetVelocity: THREE.Vector2,
  ): void {
    this.targetPositionEl.textContent = `X: ${targetPosition.x.toFixed(0)}, Y: ${targetPosition.y.toFixed(0)}`;
    this.targetVelocityEl.textContent = `X: ${targetVelocity.x.toFixed(1)}, Y: ${targetVelocity.y.toFixed(1)}`;
  }

  /**
   * 命中率表示を更新
   * @param hitCount ヒットした発射体の数
   * @param shotCount 発射した発射体の総数
   */
  updateHitRate(hitCount: number, shotCount: number): void {
    const rate =
      shotCount > 0 ? ((hitCount / shotCount) * 100).toFixed(1) : "0";
    this.hitRateEl.textContent = `${hitCount}/${shotCount} (${rate}%)`;
  }

  /**
   * 予測到達時間表示を更新
   * @param timeToTarget 予測到達時間
   */
  updateTimeToTarget(timeToTarget: number): void {
    this.timeToTargetEl.textContent = timeToTarget.toFixed(2) + " 秒";
  }
}
