/**
 * ユーザー入力と制御に関するモジュール
 * マウス入力やその他の入力制御を担当
 */

import * as THREE from "three";

import type { RenderingEngine } from "../core/renderer";
import type { SimulationSettings } from "../core/settings";
import type { VelocityFilter } from "../utils/filters";

/**
 * 入力制御クラス
 * ユーザー入力の処理とターゲットの移動制御を担当
 */
export class InputController {
  private renderingEngine: RenderingEngine;
  private currentMousePosition: THREE.Vector2;
  private lastPosition: THREE.Vector2;
  private targetPosition: THREE.Vector2;
  private targetVelocity: THREE.Vector2;
  private targetAngle: number;

  /**
   * コンストラクタ
   * @param renderingEngine レンダリングエンジン
   */
  constructor(renderingEngine: RenderingEngine) {
    this.renderingEngine = renderingEngine;
    this.currentMousePosition = new THREE.Vector2(0, 0);
    this.lastPosition = new THREE.Vector2(0, 0);
    this.targetPosition = new THREE.Vector2(0, 0);
    this.targetVelocity = new THREE.Vector2(0, 0);
    this.targetAngle = 0;

    // イベントリスナー設定
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    window.addEventListener("click", this.onClick.bind(this));
  }

  /**
   * マウス移動イベントハンドラ
   * @param event マウスイベント
   */
  private onMouseMove(event: MouseEvent): void {
    // スクリーン座標からワールド座標に変換
    // ズーム倍率とカメラ位置が考慮される
    const worldPos = this.renderingEngine.screenToWorld(
      event.clientX,
      event.clientY,
    );
    this.currentMousePosition.set(worldPos.x, worldPos.y);
  }

  /**
   * クリックイベントハンドラ
   * @param _event マウスイベント（未使用）
   */
  private onClick(_event: MouseEvent): void {
    // 必要に応じてクリック処理を実装
    // 例: 発射体発射トリガーなど
    this.fireCallback?.();
  }

  // 発射コールバック（外部から設定）
  private fireCallback: (() => void) | null = null;

  /**
   * 発射コールバックを設定
   * @param callback 発射時に呼び出される関数
   */
  setFireCallback(callback: () => void): void {
    this.fireCallback = callback;
  }

  /**
   * ターゲット位置の更新
   * @param settings シミュレーション設定
   * @param deltaTime 前回更新からの経過時間（秒）
   * @param velocityFilter 速度フィルター
   * @returns 更新されたターゲット情報
   */
  updateTargetPosition(
    settings: SimulationSettings,
    deltaTime: number,
    velocityFilter: VelocityFilter,
  ): { position: THREE.Vector2; velocity: THREE.Vector2 } {
    const newPosition = new THREE.Vector2();

    switch (settings.targetMotion.type) {
      case "mouse":
        newPosition.copy(this.currentMousePosition);
        break;

      case "linearConstant":
        this.targetAngle +=
          (settings.targetMotion.linearSpeed * deltaTime) /
          settings.targetMotion.linearLength;
        if (this.targetAngle > 1) this.targetAngle = -1;
        newPosition.x =
          settings.targetMotion.centerX +
          this.targetAngle * settings.targetMotion.linearLength;
        newPosition.y = settings.targetMotion.centerY;
        break;

      case "circularConstant":
        this.targetAngle += settings.targetMotion.circularSpeed * deltaTime;
        newPosition.x =
          settings.targetMotion.centerX +
          Math.cos(this.targetAngle) * settings.targetMotion.circularRadius;
        newPosition.y =
          settings.targetMotion.centerY +
          Math.sin(this.targetAngle) * settings.targetMotion.circularRadius;
        break;
    }

    // 速度計算（位置の差分から）
    const rawVelocity = new THREE.Vector2()
      .copy(newPosition)
      .sub(this.lastPosition)
      .divideScalar(deltaTime);

    // 速度フィルター適用
    const filteredVelocity = velocityFilter.filter({
      x: rawVelocity.x,
      y: rawVelocity.y,
    });

    // 値の更新
    this.targetVelocity.set(filteredVelocity.x, filteredVelocity.y);
    this.targetPosition.copy(newPosition);
    this.lastPosition.copy(newPosition);

    // メッシュ位置更新
    this.renderingEngine.updateTargetPosition(
      new THREE.Vector3(this.targetPosition.x, this.targetPosition.y, 0),
    );

    return {
      position: this.targetPosition.clone(),
      velocity: this.targetVelocity.clone(),
    };
  }

  /**
   * ターゲット位置を取得
   */
  getTargetPosition(): THREE.Vector2 {
    return this.targetPosition.clone();
  }

  /**
   * ターゲット速度を取得
   */
  getTargetVelocity(): THREE.Vector2 {
    return this.targetVelocity.clone();
  }

  /**
   * リソースの解放
   */
  dispose(): void {
    window.removeEventListener("mousemove", this.onMouseMove.bind(this));
    window.removeEventListener("click", this.onClick.bind(this));
  }
}
