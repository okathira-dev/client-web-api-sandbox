import { atom, useAtomValue, useSetAtom } from "jotai";

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

export interface SimulationSettings {
  projectileSpeed: number;
  targetSize: number;
  predictionLineLength: number;
  velocityFilterLength: number; // 移動平均フィルター用のサンプル数
  filterType: FilterType; // 使用するフィルタータイプ
  // ターゲット動作の設定
  targetMotion: {
    type: TargetMotionType; // ターゲットの動作モード
    // 動きの中心点
    centerX: number; // 中心点X座標
    centerY: number; // 中心点Y座標
    // 等速直線運動用パラメータ
    linearSpeed: number; // 速度 (px/秒)
    linearLength: number; // 移動距離 (px)
    // 等速円運動用パラメータ
    circularRadius: number; // 半径 (px)
    circularSpeed: number; // 角速度 (ラジアン/秒)
  };
  // 各フィルター用のパラメータ
  filterParams: {
    // 単純指数平滑化
    singleExponentialAlpha: number; // 平滑化係数 (0-1)
    // 二重指数平滑化
    doubleExponentialAlpha: number; // 平滑化係数 (0-1)
    doubleExponentialBeta: number; // トレンド係数 (0-1)
    // カルマンフィルター
    kalmanProcessNoise: number; // プロセスノイズ
    kalmanMeasurementNoise: number; // 測定ノイズ
    // One-Euro フィルター
    oneEuroMinCutoff: number; // 最小カットオフ周波数
    oneEuroBeta: number; // 速度に対するカットオフスロープ
    oneEuroDcutoff: number; // 導関数のカットオフ周波数
  };
}

// atomそのものはエクスポートしない
const simulationSettingsAtom = atom<SimulationSettings>({
  projectileSpeed: 200,
  targetSize: 10,
  predictionLineLength: 100,
  velocityFilterLength: 5,
  filterType: "none", // デフォルトはフィルターなし
  targetMotion: {
    type: "mouse", // デフォルトはマウス操作
    centerX: 0, // デフォルトは中心点(0, 0)
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
});

// 読み取り用のフック
export function useSimulationSettings() {
  return useAtomValue(simulationSettingsAtom);
}

// 書き込み用のフック
export function useSetSimulationSettings() {
  return useSetAtom(simulationSettingsAtom);
}
