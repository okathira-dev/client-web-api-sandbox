import type { Vector2D } from "../domain/projectile";
import type { SimulationSettings } from "../features/projectileDirectorSimulator/atoms/simulationAtoms";

/**
 * 1次元の値に対するフィルタリングのインターフェース
 * （速度のx成分とy成分それぞれに対して個別に適用）
 */
interface Filter1D {
  filter: (value: number) => number;
  reset: () => void;
}

/**
 * 2次元ベクトルに対するフィルタリングのインターフェース
 */
export interface VelocityFilter {
  filter: (velocity: Vector2D) => Vector2D;
  reset: () => void;
}

/**
 * 移動平均フィルターの実装
 */
class MovingAverageFilter implements Filter1D {
  private values: number[] = [];
  private maxLength: number;

  constructor(maxLength: number = 5) {
    this.maxLength = Math.max(1, maxLength);
  }

  filter(value: number): number {
    // 配列に値を追加
    this.values.push(value);

    // 指定された長さを超えた場合、古い値を削除
    if (this.values.length > this.maxLength) {
      this.values.shift();
    }

    // 平均値を計算
    const sum = this.values.reduce((acc, val) => acc + val, 0);
    return sum / this.values.length;
  }

  reset(): void {
    this.values = [];
  }
}

/**
 * 単純指数平滑化フィルターの実装
 */
class SingleExponentialFilter implements Filter1D {
  private lastOutput: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.2) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  filter(value: number): number {
    if (this.lastOutput === null) {
      this.lastOutput = value;
      return value;
    }

    // 単純指数平滑化の計算
    this.lastOutput = this.alpha * value + (1 - this.alpha) * this.lastOutput;
    return this.lastOutput;
  }

  reset(): void {
    this.lastOutput = null;
  }
}

/**
 * 二重指数平滑化フィルターの実装
 */
class DoubleExponentialFilter implements Filter1D {
  private lastSmoothed: number | null = null;
  private lastTrend: number | null = null;
  private alpha: number;
  private beta: number;

  constructor(alpha: number = 0.2, beta: number = 0.1) {
    this.alpha = Math.max(0, Math.min(1, alpha));
    this.beta = Math.max(0, Math.min(1, beta));
  }

  filter(value: number): number {
    if (this.lastSmoothed === null || this.lastTrend === null) {
      this.lastSmoothed = value;
      this.lastTrend = 0;
      return value;
    }

    // レベル（S）の計算
    const newSmoothed =
      this.alpha * value +
      (1 - this.alpha) * (this.lastSmoothed + this.lastTrend);

    // トレンド（b）の計算
    const newTrend =
      this.beta * (newSmoothed - this.lastSmoothed) +
      (1 - this.beta) * this.lastTrend;

    // 状態の更新
    this.lastSmoothed = newSmoothed;
    this.lastTrend = newTrend;

    // フィルター後の値を返す
    return newSmoothed;
  }

  reset(): void {
    this.lastSmoothed = null;
    this.lastTrend = null;
  }
}

/**
 * カルマンフィルターの実装（簡易版：1次元）
 */
class KalmanFilter implements Filter1D {
  private x: number | null = null; // 状態推定値
  private p: number = 1.0; // 推定誤差共分散
  private q: number; // プロセスノイズ
  private r: number; // 測定ノイズ

  constructor(processNoise: number = 0.01, measurementNoise: number = 0.1) {
    this.q = processNoise;
    this.r = measurementNoise;
  }

  filter(value: number): number {
    // 初期値の設定
    if (this.x === null) {
      this.x = value;
      this.p = 1.0;
      return value;
    }

    // 予測ステップ
    const x_pred = this.x;
    const p_pred = this.p + this.q;

    // 更新ステップ
    const k = p_pred / (p_pred + this.r); // カルマンゲイン
    this.x = x_pred + k * (value - x_pred);
    this.p = (1 - k) * p_pred;

    return this.x;
  }

  reset(): void {
    this.x = null;
    this.p = 1.0;
  }
}

/**
 * TODO: One-Euro Filterの実装
 * 参考: https://github.com/casiez/OneEuroFilter
 */

/**
 * 2次元ベクトルフィルターのラッパー
 */
class Vector2DFilter implements VelocityFilter {
  private xFilter: Filter1D;
  private yFilter: Filter1D;

  constructor(filterCreator: () => Filter1D) {
    this.xFilter = filterCreator();
    this.yFilter = filterCreator();
  }

  filter(velocity: Vector2D): Vector2D {
    return {
      x: this.xFilter.filter(velocity.x),
      y: this.yFilter.filter(velocity.y),
    };
  }

  reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
  }
}

/**
 * フィルターファクトリー：フィルタータイプとパラメータから適切なフィルターを生成
 */
export function createVelocityFilter(
  settings: SimulationSettings,
): VelocityFilter {
  const { filterType, filterParams } = settings;

  switch (filterType) {
    case "none":
      // フィルターなし（入力をそのまま出力）
      return {
        filter: (velocity) => velocity,
        reset: () => {},
      };

    case "movingAverage":
      return new Vector2DFilter(
        () => new MovingAverageFilter(settings.velocityFilterLength),
      );

    case "singleExponential":
      return new Vector2DFilter(
        () => new SingleExponentialFilter(filterParams.singleExponentialAlpha),
      );

    case "doubleExponential":
      return new Vector2DFilter(
        () =>
          new DoubleExponentialFilter(
            filterParams.doubleExponentialAlpha,
            filterParams.doubleExponentialBeta,
          ),
      );

    case "kalmanFilter":
      return new Vector2DFilter(
        () =>
          new KalmanFilter(
            filterParams.kalmanProcessNoise,
            filterParams.kalmanMeasurementNoise,
          ),
      );

    case "oneEuroFilter":
      // TODO: One-Euro フィルターが正しく実装されるまでは入力をそのまま返す
      return {
        filter: (velocity) => velocity,
        reset: () => {},
      };

    default:
      // デフォルトはフィルターなし
      return {
        filter: (velocity) => velocity,
        reset: () => {},
      };
  }
}
