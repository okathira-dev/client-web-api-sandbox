/**
 * シミュレーション設定に関するモジュール
 * フィルタータイプと目標の動作モード、およびシミュレーション設定を定義
 */

// フィルタータイプの定義
export type FilterType =
  | "none"
  | "movingAverage"
  | "singleExponential"
  | "doubleExponential"
  | "kalmanFilter"
  | "oneEuroFilter";

// ターゲットの動作モードを定義
export type TargetMotionType = "mouse" | "linearConstant" | "circularConstant";

// シミュレーション設定のインターフェース
export interface SimulationSettings {
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

// シミュレーション設定の初期値
export const defaultSimulationSettings: SimulationSettings = {
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
