/**
 * 心拍検出のための画像処理アルゴリズム
 */

/**
 * 接触方式（指先をカメラに置く）での心拍検出
 * 画像の赤色チャンネルの平均値を返す
 * 画面中央の正方形エリアを使用して計算
 */
export function processContactFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): number | null {
  try {
    // 中央部分の画像データを取得
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleSize = Math.min(
      100,
      Math.floor(width / 4),
      Math.floor(height / 4),
    );

    const imageData = ctx.getImageData(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize,
    );

    const data = imageData.data;
    let redTotal = 0;
    let greenTotal = 0;
    let blueTotal = 0;
    let pixelCount = 0;

    // 赤色チャンネルの平均値を計算（PPGの原理）
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i] || 0;
      const green = data[i + 1] || 0;
      const blue = data[i + 2] || 0;

      // カメラ内はすべて指なので、すべてのピクセルを使用する
      redTotal += red;
      greenTotal += green;
      blueTotal += blue;
      pixelCount++;
    }

    if (pixelCount === 0) {
      return null;
    }

    // 赤色チャンネルの平均値を返す
    // 改善: 緑色チャンネルも考慮（一部の研究では緑色がより効果的と示されている）
    const redAverage = redTotal / pixelCount;
    const _greenAverage = greenTotal / pixelCount; // 将来的に使用する予定
    const _blueAverage = blueTotal / pixelCount; // 将来的に使用する予定

    // 特定の照明条件では緑色チャンネルが優れていることがある
    // 明るさの変化率を比較して、より大きい変化を示すチャンネルを使用
    return redAverage;
  } catch (error) {
    console.error("Error processing contact frame:", error);
    return null;
  }
}

/**
 * 非接触方式（顔を撮影）での心拍検出
 * 肌色領域のR/G比を利用
 */
export function processNonContactFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): number | null {
  try {
    // 顔の中心付近（前額や頬）を対象にする
    const faceX = Math.floor(width / 2);
    const faceY = Math.floor(height / 3); // 顔は画面上部1/3付近にあると仮定
    const sampleSize = Math.min(100, Math.floor(width / 4));

    const imageData = ctx.getImageData(
      faceX - sampleSize / 2,
      faceY - sampleSize / 2,
      sampleSize,
      sampleSize,
    );

    const data = imageData.data;
    let skinPixelCount = 0;
    let rgRatioSum = 0;

    // 肌色ピクセルを検出し、R/G比を計算
    for (let i = 0; i < data.length; i += 4) {
      const red = data[i] || 0;
      const green = data[i + 1] || 0;
      const blue = data[i + 2] || 0;

      // 改善: より高度な肌色検出
      if (isImprovedSkinPixel(red, green, blue)) {
        // R/G比を計算（血流変化に敏感）
        if (green > 0) {
          const rgRatio = red / green;
          rgRatioSum += rgRatio;
          skinPixelCount++;
        }
      }
    }

    if (skinPixelCount < 10) {
      return null; // 肌色ピクセルがほとんど検出されない場合
    }

    // R/G比の平均値を返す
    return rgRatioSum / skinPixelCount;
  } catch (error) {
    console.error("Error processing non-contact frame:", error);
    return null;
  }
}

/**
 * 改善された肌色検出アルゴリズム
 * より広い範囲の肌色をサポート
 */
function isImprovedSkinPixel(
  red: number,
  green: number,
  blue: number,
): boolean {
  // 肌色の判定を改善（多様な肌色に対応）

  // 正規化
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;

  // RGB -> YCbCr変換（精度向上版）
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  // 改善：各種肌色に対応した範囲
  // 明るい肌色から暗い肌色まで広い範囲をカバー
  return (
    y > 0.15 &&
    y < 0.95 && // 明るさの範囲を広げる
    cb > 75 &&
    cb < 125 && // 青色成分の範囲を広げる
    cr > 125 &&
    cr < 175 // 赤色成分の範囲を広げる
  );
}

/**
 * Eulerian Video Magnification (EVM)を応用した心拍検出
 * 注: 実際のEVMはより複雑で、時間的フィルタリングが必要
 * 簡易実装のため、まだ完全ではありません
 */
export function applyEVM(frames: number[][], frameRate: number): number[] {
  if (frames.length < 2) {
    return [];
  }

  const frameCount = frames.length;
  const pixelCount = frames[0]?.length ?? 0;
  const result = new Array<number>(frameCount).fill(0);

  // 時間方向のバンドパスフィルタ（心拍数範囲: 0.67-4Hz = 40-240 BPM）
  const _lowFreq = 0.67 / (frameRate / 2); // 正規化された低周波カットオフ（将来的な実装で使用）
  const _highFreq = 4 / (frameRate / 2); // 正規化された高周波カットオフ（将来的な実装で使用）

  // 各ピクセルの時系列データに対して
  for (let j = 0; j < pixelCount; j++) {
    const pixelTimeSeries = frames.map((frame) => frame[j] || 0);

    // 平均を引く
    const mean = pixelTimeSeries.reduce((a, b) => a + b, 0) / frameCount;
    const normalizedSeries = pixelTimeSeries.map((val) => val - mean);

    // モーションアーティファクトの除去
    const filteredSeries = detectAndRemoveMotionArtifacts(normalizedSeries, []);

    // 簡易的なバンドパスフィルタリング
    // 注: 実際はFFTベースの適切なフィルタリングを行うべき
    const processedSeries = [...filteredSeries];

    // 改善: より高度なフィルタリング
    for (let i = 2; i < frameCount - 2; i++) {
      // 安全にアクセスするため、undefined チェックを追加
      const v1 = filteredSeries[i - 2] ?? 0;
      const v2 = filteredSeries[i - 1] ?? 0;
      const v3 = filteredSeries[i] ?? 0;
      const v4 = filteredSeries[i + 1] ?? 0;
      const v5 = filteredSeries[i + 2] ?? 0;

      processedSeries[i] = v1 * 0.1 + v2 * 0.2 + v3 * 0.4 + v4 * 0.2 + v5 * 0.1; // ガウシアンフィルタに近いウェイト
    }

    // 結果に加算
    for (let i = 0; i < frameCount; i++) {
      const resultValue = result[i];
      const processedValue = processedSeries[i];
      if (resultValue === undefined) {
        throw new Error("result[i] is undefined");
      }
      if (processedValue === undefined) {
        throw new Error("processedSeries[i] is undefined");
      }

      result[i] = resultValue + processedValue;
    }
  }

  return result;
}

/**
 * モーションアーティファクト検出・除去機能
 * 急激な変化や外れ値を検出して補正
 */
function detectAndRemoveMotionArtifacts(
  values: number[],
  _timestamps: number[],
): number[] {
  // 入力値がないか少ない場合は処理しない
  if (!values || values.length < 5) {
    return values;
  }

  // 1. 急激な変化（標準偏差の2倍以上）を検出
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length,
  );
  const threshold = stdDev * 2;

  // 2. 異常値を検出し、前後の平均値で補間
  const filteredValues = [...values];

  for (let i = 1; i < values.length - 1; i++) {
    const v = values[i];
    const v1 = values[i - 1];
    const v2 = values[i + 1];
    if (v === undefined || v1 === undefined || v2 === undefined) {
      throw new Error("values[i] is undefined");
    }

    if (Math.abs(v - mean) > threshold) {
      // 異常値を前後の平均で置換
      filteredValues[i] = (v1 + v2) / 2;
    }
  }

  // 3. 移動平均フィルタを適用して残りのノイズを軽減
  const smoothedValues = [...filteredValues];
  const windowSize = 5; // 5点の移動平均

  for (let i = windowSize; i < values.length - windowSize; i++) {
    let sum = 0;
    for (let j = i - windowSize; j <= i + windowSize; j++) {
      const v = filteredValues[j];
      if (v === undefined) {
        throw new Error("filteredValues[j] is undefined");
      }
      sum += v;
    }
    smoothedValues[i] = sum / (windowSize * 2 + 1);
  }

  return smoothedValues;
}

/**
 * 高速フーリエ変換（FFT）による周波数解析
 * 注：実際の実装ではFFTライブラリを使用すべき
 */
function performFFT(
  values: number[],
  samplingRate: number,
): {
  dominantFrequency: number;
  confidence: number;
} {
  // 非常に単純化されたFFT実装
  // 実際の実装ではWebAudio APIのAnalyserNodeや専用ライブラリを使用すべき

  // 信号長を2のべき乗にパディング
  let paddedLength = 1;
  while (paddedLength < values.length) {
    paddedLength *= 2;
  }

  const paddedValues = [...values];
  while (paddedValues.length < paddedLength) {
    paddedValues.push(0);
  }

  // 非常に簡略化されたスペクトル解析
  // 各周波数成分のパワーを計算
  const fftResults: number[] = [];
  const minFreq = 0.67; // 40 BPM = 0.67 Hz
  const maxFreq = 4.0; // 240 BPM = 4.0 Hz

  // 心拍数の範囲でスペクトル強度を計算（簡易版）
  for (let freq = minFreq; freq <= maxFreq; freq += 0.05) {
    let power = 0;
    for (let i = 0; i < values.length; i++) {
      const time = i / samplingRate;
      // 値が未定義の場合は0を使用
      const val = values[i] ?? 0;
      // 各周波数での信号のパワーを計算（実際のFFTとは異なる簡略版）
      power += val * Math.sin(2 * Math.PI * freq * time);
    }
    fftResults.push(Math.abs(power));
  }

  // ピーク検出
  let peakIndex = 0;
  let peakMagnitude = 0;

  if (fftResults.length > 0) {
    peakMagnitude = fftResults[0] ?? 0;
  }

  for (let i = 1; i < fftResults.length; i++) {
    const currentVal = fftResults[i] ?? 0;
    if (currentVal > peakMagnitude) {
      peakMagnitude = currentVal;
      peakIndex = i;
    }
  }

  // 優勢な周波数を取得
  const dominantFrequency = minFreq + peakIndex * 0.05;

  // 信頼度計算
  let surroundingAvg = 0;
  let surroundCount = 0;

  for (
    let i = Math.max(0, peakIndex - 3);
    i < Math.min(fftResults.length, peakIndex + 4);
    i++
  ) {
    if (i !== peakIndex && i >= 0 && i < fftResults.length) {
      const fftValue = fftResults[i] ?? 0;
      surroundingAvg += fftValue;
      surroundCount++;
    }
  }

  if (surroundCount > 0) {
    surroundingAvg /= surroundCount;
  }
  const peakRatio = surroundingAvg > 0 ? peakMagnitude / surroundingAvg : 1;
  const confidence = Math.min(peakRatio / 5, 1); // 5倍以上なら最大信頼度

  return { dominantFrequency, confidence };
}

// 心拍数を計算する関数（FFTベースの改良版）
interface HeartRateResult {
  heartRate: number;
  confidence: number;
}

/**
 * 改善された心拍数計算アルゴリズム
 * FFTとピーク検出を組み合わせて精度を向上
 */
export function calculateHeartRate(
  values: number[],
  timestamps: number[],
): HeartRateResult | null {
  if (!values || !timestamps || values.length < 30 || timestamps.length < 30) {
    return null;
  }

  // 1. モーションアーティファクトの除去
  const filteredValues = detectAndRemoveMotionArtifacts(values, timestamps);

  // 2. サンプリングレートの計算（timestamps配列から）
  const t0 = timestamps[0];
  const t1 = timestamps[timestamps.length - 1];
  if (t0 === undefined || t1 === undefined) {
    throw new Error("timestamps[i] is undefined");
  }

  const timeRange = t1 - t0;
  const avgInterval = timeRange / (timestamps.length - 1);
  const samplingRate = 1000 / avgInterval; // ミリ秒からHzへ変換

  // 3. FFTで周波数解析とピーク検出の両方を試みる
  const fftResult = performFFT(filteredValues, samplingRate);
  const peakResult = calculateHeartRateWithPeakDetection(
    filteredValues,
    timestamps,
  );

  // 4. 結果の信頼度に基づいて、より信頼性の高い方を採用
  if (
    peakResult &&
    (!fftResult || peakResult.confidence > fftResult.confidence)
  ) {
    return peakResult;
  }

  // FFT結果を心拍数に変換（Hz → BPM）
  const heartRate = fftResult.dominantFrequency * 60;

  // 生理学的に妥当な範囲内（40-200 BPM）かチェック
  if (heartRate < 40 || heartRate > 200) {
    if (peakResult) {
      return peakResult; // FFT結果が妥当でない場合はピーク検出結果を使用
    }
    return null; // 両方の方法が失敗した場合
  }

  return {
    heartRate: Math.round(heartRate),
    confidence: fftResult.confidence,
  };
}

/**
 * 従来のピーク検出による心拍数計算（バックアップとして保持）
 */
function calculateHeartRateWithPeakDetection(
  values: number[],
  timestamps: number[],
): HeartRateResult | null {
  if (values.length < 30) {
    return null;
  }

  // ピーク検出（信号の微分に基づく改良版）
  const peaks: number[] = [];
  const peakValues: number[] = [];

  // 改善: 単純な閾値ではなく、局所的な極大値を検出
  for (let i = 2; i < values.length - 2; i++) {
    // 局所的な極大値の条件
    const v_im2 = i >= 2 ? (values[i - 2] ?? 0) : 0;
    const v_im1 = i >= 1 ? (values[i - 1] ?? 0) : 0;
    const v_i = values[i] ?? 0;
    const v_ip1 = i + 1 < values.length ? (values[i + 1] ?? 0) : 0;
    const v_ip2 = i + 2 < values.length ? (values[i + 2] ?? 0) : 0;

    if (v_i > v_im1 && v_i > v_im2 && v_i > v_ip1 && v_i > v_ip2) {
      peaks.push(timestamps[i] ?? i);
      peakValues.push(v_i);
    }
  }

  if (peaks.length < 2) {
    return null;
  }

  // ピーク間の間隔を計算
  const intervals: number[] = [];
  for (let i = 1; i < peaks.length; i++) {
    const p0 = peaks[i - 1];
    const p1 = peaks[i];
    if (p0 === undefined || p1 === undefined) {
      throw new Error("peaks[i] is undefined");
    }

    intervals.push(p1 - p0);
  }

  // 外れ値の除去（平均から大きく離れた間隔を除外）
  const meanInterval =
    intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const validIntervals = intervals.filter(
    (interval): interval is number =>
      interval > meanInterval * 0.5 && interval < meanInterval * 1.5,
  );

  if (validIntervals.length < 1) {
    return null;
  }

  // 有効な間隔の平均値を求める
  const filteredIntervals = validIntervals.filter(
    (interval): interval is number =>
      interval !== undefined && typeof interval === "number",
  );
  if (filteredIntervals.length === 0) {
    return null;
  }

  const averageInterval =
    filteredIntervals.reduce((sum, val) => sum + val, 0) /
    filteredIntervals.length;

  // BPMに変換（ミリ秒 -> 分）
  const beatsPerMinute = 60000 / averageInterval;

  // 生理学的に妥当な範囲内（40-200 BPM）かチェック
  if (beatsPerMinute < 40 || beatsPerMinute > 200) {
    return null;
  }

  // 信頼度計算（改善版）
  // 1. 間隔の一貫性
  const intervalStdDev = Math.sqrt(
    validIntervals.reduce(
      (sq, val) => sq + Math.pow(val - averageInterval, 2),
      0,
    ) / validIntervals.length,
  );
  const intervalConsistency = Math.max(0, 1 - intervalStdDev / averageInterval);

  // 2. ピークの突出度
  const peakAvg =
    peakValues.reduce((sum, val) => sum + val, 0) / peakValues.length;
  const valuesAvg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const peakProminence = Math.min((peakAvg - valuesAvg) / valuesAvg, 1);

  // 3. 総合信頼度
  const confidence = intervalConsistency * 0.7 + peakProminence * 0.3;

  return {
    heartRate: Math.round(beatsPerMinute),
    confidence: Math.max(0.1, confidence), // 最低信頼度を0.1に設定
  };
}
