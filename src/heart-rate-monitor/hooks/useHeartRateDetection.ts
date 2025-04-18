import { useState, useRef, useEffect } from "react";

import {
  processContactFrame,
  processNonContactFrame,
} from "../functions/heartRateProcessing";

import type { DetectionMode } from "../heart-rate-monitor";
import type { MutableRefObject } from "react";

export type MeasurementStatus =
  | "waiting" // 開始待ち
  | "collecting" // データ収集中（3秒未満）
  | "processing" // 処理中・計算中
  | "insufficient_data" // データ不足
  | "no_peaks" // ピークなし
  | "invalid_range" // 範囲外（40-200 BPM）
  | "success"; // 測定成功

interface UseHeartRateDetectionResult {
  heartRate: number | null;
  confidence: number; // 0~1の間の値
  startDetection: () => void;
  stopDetection: () => void;
  // 測定状態の詳細情報
  status: MeasurementStatus;
  dataPoints: number; // 収集されたデータポイント数
  detectedPeaks: number; // 検出されたピーク数
  elapsedTime: number; // 経過時間（ミリ秒）
}

export const useHeartRateDetection = (
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  mode: DetectionMode,
): UseHeartRateDetectionResult => {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [status, setStatus] = useState<MeasurementStatus>("waiting");
  const [dataPoints, setDataPoints] = useState<number>(0);
  const [detectedPeaks, setDetectedPeaks] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // 計算用の一時データを保持する参照
  const dataRef = useRef<{
    timestamps: number[];
    values: number[];
    lastFrameTime: number;
    startTime: number;
    peakCount: number;
  }>({
    timestamps: [],
    values: [],
    lastFrameTime: 0,
    startTime: 0,
    peakCount: 0,
  });

  const startDetection = (): void => {
    // 既存データをリセット
    dataRef.current = {
      timestamps: [],
      values: [],
      lastFrameTime: 0,
      startTime: performance.now(),
      peakCount: 0,
    };

    setHeartRate(null);
    setConfidence(0);
    setStatus("collecting");
    setDataPoints(0);
    setDetectedPeaks(0);
    setElapsedTime(0);
    setIsDetecting(true);
  };

  const stopDetection = (): void => {
    setIsDetecting(false);
    setStatus("waiting");
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // フレーム処理ループ
  useEffect(() => {
    if (!isDetecting) return;

    const detectHeartRate = () => {
      if (!videoRef.current || !canvasRef.current || !isDetecting) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) return;

      // ビデオフレームをキャンバスに描画
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 現在の時間をミリ秒で取得
      const now = performance.now();

      // 経過時間を更新
      setElapsedTime(now - dataRef.current.startTime);

      // まだビデオが再生されていない場合は処理しない
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detectHeartRate);
        return;
      }

      let value: number | null = null;

      // モードに応じた画像処理
      if (mode === "contact") {
        value = processContactFrame(ctx, canvas.width, canvas.height);
      } else {
        value = processNonContactFrame(ctx, canvas.width, canvas.height);
      }

      // 有効な値が得られた場合、データを蓄積
      if (value !== null) {
        dataRef.current.timestamps.push(now);
        dataRef.current.values.push(value);
        setDataPoints(dataRef.current.values.length);

        // 最大10秒間のデータを保持
        const MAX_DATA_WINDOW = 10000; // 10秒
        const cutoffTime = now - MAX_DATA_WINDOW;

        while (
          dataRef.current.timestamps.length > 0 &&
          dataRef.current.timestamps[0] !== undefined &&
          dataRef.current.timestamps[0] < cutoffTime
        ) {
          dataRef.current.timestamps.shift();
          dataRef.current.values.shift();
        }

        // 収集状態の更新
        if (dataRef.current.timestamps.length < 30) {
          setStatus("collecting");
        } else if (
          dataRef.current.timestamps[0] !== undefined &&
          now - dataRef.current.timestamps[0] < 3000
        ) {
          setStatus("collecting");
        } else {
          setStatus("processing");
        }

        // 十分なデータが集まったら心拍数を計算（少なくとも3秒分）
        if (
          dataRef.current.timestamps.length > 0 &&
          dataRef.current.timestamps[0] !== undefined &&
          now - dataRef.current.timestamps[0] > 3000
        ) {
          // FFTや信号処理でピークを検出し、心拍数を計算
          // 簡略化のため、3秒ごとに更新
          if (now - dataRef.current.lastFrameTime > 3000) {
            setStatus("processing");
            // ここで実際に心拍数を計算する関数を呼び出す
            const result = calculateHeartRate(
              dataRef.current.values,
              dataRef.current.timestamps,
            );

            // 計算結果がnullの場合の原因を特定
            if (!result) {
              // データポイントが30未満の場合
              if (dataRef.current.values.length < 30) {
                setStatus("insufficient_data");
              } else {
                // ピーク検出を試行してピーク数を確認
                const peaks = detectPeaks(
                  dataRef.current.values,
                  dataRef.current.timestamps,
                );
                dataRef.current.peakCount = peaks.length;
                setDetectedPeaks(peaks.length);

                if (peaks.length < 2) {
                  setStatus("no_peaks");
                } else {
                  // ピークはあるが、計算された心拍数が範囲外
                  setStatus("invalid_range");
                }
              }
            } else {
              // 有効な結果が得られた場合
              setHeartRate(result.heartRate);
              setConfidence(result.confidence);
              dataRef.current.lastFrameTime = now;
              dataRef.current.peakCount = result.peakCount;
              setDetectedPeaks(result.peakCount);
              setStatus("success");
            }
          }
        }
      }

      // 次のフレームの処理をスケジュール
      animationFrameRef.current = requestAnimationFrame(detectHeartRate);
    };

    animationFrameRef.current = requestAnimationFrame(detectHeartRate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, videoRef, canvasRef, mode]);

  return {
    heartRate,
    confidence,
    startDetection,
    stopDetection,
    status,
    dataPoints,
    detectedPeaks,
    elapsedTime,
  };
};

// ピーク検出関数
function detectPeaks(values: number[], timestamps: number[]): number[] {
  // 結果を格納する配列
  const peaks: number[] = [];

  // 値の配列が十分な長さがない場合は早期リターン
  if (values.length < 15) {
    return peaks;
  }

  // ステップ1: 移動平均フィルタでノイズを軽減（バンドパスフィルタの簡易実装）
  // 高周波ノイズ除去（ローパスフィルタ相当）
  const windowSize = 5;
  const smoothedValues: number[] = [];

  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;

    for (
      let j = Math.max(0, i - Math.floor(windowSize / 2));
      j <= Math.min(values.length - 1, i + Math.floor(windowSize / 2));
      j++
    ) {
      const val = values[j];
      if (val !== undefined) {
        sum += val;
        count++;
      }
    }

    smoothedValues.push(count > 0 ? sum / count : 0);
  }

  // 低周波ノイズ除去（トレンド除去、ハイパスフィルタ相当）
  const detrended: number[] = [];
  const detrendWindowSize = 21; // 低周波成分の検出用ウィンドウサイズ

  for (let i = 0; i < smoothedValues.length; i++) {
    let trendSum = 0;
    let trendCount = 0;

    for (
      let j = Math.max(0, i - Math.floor(detrendWindowSize / 2));
      j <=
      Math.min(
        smoothedValues.length - 1,
        i + Math.floor(detrendWindowSize / 2),
      );
      j++
    ) {
      const val = smoothedValues[j];
      if (val !== undefined) {
        trendSum += val;
        trendCount++;
      }
    }

    const trend = trendCount > 0 ? trendSum / trendCount : 0;
    detrended.push(smoothedValues[i] - trend);
  }

  // ステップ2: 最初の予測心拍数を推定（スペクトル分析）
  // 心拍数の範囲（20-240BPM = 0.33-4.0Hz）内でのスペクトル強度を計算
  let maxPower = 0;
  let dominantPeriod = 0;

  // 測定データの時間間隔を計算（データサンプリングレート）
  let samplingInterval = 0;
  let sampleCount = 0;

  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] !== undefined && timestamps[i - 1] !== undefined) {
      samplingInterval += timestamps[i] - timestamps[i - 1];
      sampleCount++;
    }
  }

  // 平均サンプリング間隔の計算
  samplingInterval = sampleCount > 0 ? samplingInterval / sampleCount : 33; // デフォルト30Hz

  // 各周期に対するスペクトル分析
  for (let period = 250; period <= 3000; period += 50) {
    // 20-240BPMの範囲を探索
    let power = 0;

    for (let i = 0; i < detrended.length; i++) {
      // サイン波による相関（簡易スペクトル分析）
      const phase = i * samplingInterval * ((2 * Math.PI) / period);
      power += detrended[i] * Math.sin(phase);
    }

    power = Math.abs(power);

    if (power > maxPower) {
      maxPower = power;
      dominantPeriod = period;
    }
  }

  // 最適な検出閾値の計算
  // まず平均と標準偏差を計算
  let mean = 0;
  for (const val of detrended) {
    mean += val;
  }
  mean /= detrended.length;

  let stdDev = 0;
  for (const val of detrended) {
    stdDev += (val - mean) * (val - mean);
  }
  stdDev = Math.sqrt(stdDev / detrended.length);

  // 閾値 = 平均 + k * 標準偏差 (kは閾値係数)
  const threshold = mean + 2.0 * stdDev;

  // ステップ3: 適応的な最小ピーク間隔の設定
  // 推定された心拍周期の65%を最小間隔として使用
  const minPeakDistance = dominantPeriod * 0.65;

  // ステップ4: ピーク検出
  // 1. 候補ピークの検出（閾値と局所最大値の条件）
  // 2. 生理学的フィルタリング（最小間隔）
  const candidatePeaks: number[] = [];
  const candidateValues: number[] = [];

  for (let i = 1; i < detrended.length - 1; i++) {
    const current = detrended[i];
    const prev = detrended[i - 1];
    const next = detrended[i + 1];

    if (current !== undefined && prev !== undefined && next !== undefined) {
      // 局所的な最大値かつ閾値より大きい
      if (current > threshold && current > prev && current > next) {
        candidatePeaks.push(i);
        candidateValues.push(current);
      }
    }
  }

  // ステップ5: 生理学的に妥当なピークのみを選択
  if (candidatePeaks.length > 0) {
    // 最初のピークを追加
    let lastPeakIdx = candidatePeaks[0];
    const timestamp = timestamps[lastPeakIdx];

    if (timestamp !== undefined) {
      peaks.push(timestamp);
    }

    // 残りのピークを評価
    for (let i = 1; i < candidatePeaks.length; i++) {
      const currentPeakIdx = candidatePeaks[i];
      const currentTimestamp = timestamps[currentPeakIdx];
      const lastTimestamp = timestamps[lastPeakIdx];

      if (currentTimestamp !== undefined && lastTimestamp !== undefined) {
        const interval = currentTimestamp - lastTimestamp;

        // 最小間隔条件を満たすピークのみを追加
        if (interval >= minPeakDistance) {
          peaks.push(currentTimestamp);
          lastPeakIdx = currentPeakIdx;
        } else {
          // 間隔が短すぎる場合は、振幅が大きい方を選択
          if (candidateValues[i] > candidateValues[i - 1]) {
            // 新しいピークの方が大きい場合、前のピークを上書き
            peaks.pop();
            peaks.push(currentTimestamp);
            lastPeakIdx = currentPeakIdx;
          }
          // そうでなければ現在のピークを無視
        }
      }
    }
  }

  // ステップ6: 最終的な検証（間隔の一貫性チェック）
  if (peaks.length >= 3) {
    const intervals: number[] = [];

    // 間隔を計算
    for (let i = 1; i < peaks.length; i++) {
      if (peaks[i] !== undefined && peaks[i - 1] !== undefined) {
        intervals.push(peaks[i] - peaks[i - 1]);
      }
    }

    if (intervals.length > 0) {
      // 間隔の中央値を計算
      intervals.sort((a, b) => a - b);
      const medianInterval = intervals[Math.floor(intervals.length / 2)];

      // 間隔の中央値から大きく外れたピークを除外
      const filteredPeaks: number[] = [];
      let lastValidPeak = peaks[0];

      if (lastValidPeak !== undefined) {
        filteredPeaks.push(lastValidPeak);
      }

      for (let i = 1; i < peaks.length; i++) {
        const currentPeak = peaks[i];

        if (currentPeak !== undefined && lastValidPeak !== undefined) {
          const interval = currentPeak - lastValidPeak;

          // 中央値の50%〜200%の範囲内なら有効なピーク
          if (
            interval >= medianInterval * 0.5 &&
            interval <= medianInterval * 2.0
          ) {
            filteredPeaks.push(currentPeak);
            lastValidPeak = currentPeak;
          }
          // 間隔が長すぎる場合、ピークを見逃している可能性があるが許容
          else if (interval > medianInterval * 2.0) {
            filteredPeaks.push(currentPeak);
            lastValidPeak = currentPeak;
          }
          // 間隔が短すぎる場合は無視（おそらくノイズ）
        }
      }

      return filteredPeaks;
    }
  }

  return peaks;
}

// 心拍数を計算する関数（実際の実装では、より複雑な信号処理を行います）
interface HeartRateResult {
  heartRate: number;
  confidence: number;
  peakCount: number;
}

function calculateHeartRate(
  values: number[],
  timestamps: number[],
): HeartRateResult | null {
  if (values.length < 30) {
    return null;
  }

  // 簡易的なピーク検出によるBPM計算
  // 実際の実装ではFFTや他の信号処理アルゴリズムを使用するべき
  const peaks = detectPeaks(values, timestamps);

  if (peaks.length < 2) {
    return null;
  }

  // ピーク間の平均時間を計算
  let totalInterval = 0;
  for (let i = 1; i < peaks.length; i++) {
    const currentPeak = peaks[i];
    const prevPeak = peaks[i - 1];
    if (currentPeak !== undefined && prevPeak !== undefined) {
      totalInterval += currentPeak - prevPeak;
    }
  }

  const averageInterval = totalInterval / (peaks.length - 1);

  // BPMに変換（ミリ秒 -> 分）
  const beatsPerMinute = 60000 / averageInterval;

  // 生理学的に妥当な範囲内（20-240 BPM）かチェック
  if (beatsPerMinute < 20 || beatsPerMinute > 240) {
    return null;
  }

  // 簡易的な信頼度計算（ピーク数に基づく）
  const lastTimestamp = timestamps[timestamps.length - 1];
  const firstTimestamp = timestamps[0];

  // 両方のタイムスタンプが存在することを確認
  const maxPeaks =
    lastTimestamp !== undefined && firstTimestamp !== undefined
      ? (lastTimestamp - firstTimestamp) / 600 // 約100BPMでの理論上のピーク数
      : 1; // デフォルト値
  const confidenceValue = Math.min(peaks.length / maxPeaks, 1);

  return {
    heartRate: Math.round(beatsPerMinute),
    confidence: confidenceValue,
    peakCount: peaks.length,
  };
}
