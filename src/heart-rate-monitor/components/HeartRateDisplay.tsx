import type { MeasurementStatus } from "../hooks/useHeartRateDetection";
import type React from "react";

interface HeartRateDisplayProps {
  heartRate: number | null;
  confidence: number;
  status: MeasurementStatus;
  dataPoints: number;
  detectedPeaks: number;
  elapsedTime: number;
}

export const HeartRateDisplay: React.FC<HeartRateDisplayProps> = ({
  heartRate,
  confidence,
  status,
  dataPoints,
  detectedPeaks,
  elapsedTime,
}) => {
  const getConfidenceText = (confidenceValue: number): string => {
    if (confidenceValue > 0.8) {
      return "高精度";
    } else if (confidenceValue > 0.5) {
      return "中精度";
    } else {
      return "低精度";
    }
  };

  const getConfidenceColor = (confidenceValue: number): string => {
    if (confidenceValue > 0.8) {
      return "#4caf50"; // 緑
    } else if (confidenceValue > 0.5) {
      return "#ff9800"; // オレンジ
    } else {
      return "#f44336"; // 赤
    }
  };

  const getStatusMessage = (status: MeasurementStatus): string => {
    switch (status) {
      case "waiting":
        return "測定を開始してください";
      case "collecting":
        return "データ収集中...";
      case "processing":
        return "処理中...";
      case "insufficient_data":
        return "データ不足（指をしっかり押し当ててください）";
      case "no_peaks":
        return "脈波を検出できません（光量を確認してください）";
      case "invalid_range":
        return "測定範囲外（20-240 BPM）";
      case "success":
        return "測定完了";
      default:
        return "測定中...";
    }
  };

  const getStatusColor = (status: MeasurementStatus): string => {
    switch (status) {
      case "success":
        return "#4caf50"; // 緑
      case "waiting":
      case "collecting":
      case "processing":
        return "#2196f3"; // 青
      case "insufficient_data":
      case "no_peaks":
      case "invalid_range":
        return "#f44336"; // 赤
      default:
        return "#757575"; // グレー
    }
  };

  // 経過時間のフォーマット（秒単位）
  const formatElapsedTime = (ms: number): string => {
    return (ms / 1000).toFixed(1) + "秒";
  };

  return (
    <div className="heart-rate-display">
      <div className="heart-icon">❤️</div>

      {heartRate ? (
        <div className="heart-rate-value">
          <span className="bpm-value">{heartRate}</span>
          <span className="bpm-unit">BPM</span>
        </div>
      ) : (
        <div className="heart-rate-value measuring">
          <span>{getStatusMessage(status)}</span>
        </div>
      )}

      {heartRate && (
        <div
          className="confidence-indicator"
          style={{ color: getConfidenceColor(confidence) }}
        >
          信頼度: {getConfidenceText(confidence)}
        </div>
      )}

      <div className="measurement-details">
        <div
          className="status-indicator"
          style={{ color: getStatusColor(status) }}
        >
          {status !== "waiting" && (
            <>
              <span>状態: {getStatusMessage(status)}</span>
              <div className="measurement-stats">
                <span>データ点: {dataPoints}</span>
                <span>検出ピーク: {detectedPeaks}</span>
                <span>経過時間: {formatElapsedTime(elapsedTime)}</span>
              </div>

              <div className="measurement-requirements">
                <div className={`req ${dataPoints >= 30 ? "met" : "unmet"}`}>
                  データ点: 30以上 {dataPoints >= 30 ? "✓" : "✗"}
                </div>
                <div className={`req ${detectedPeaks >= 2 ? "met" : "unmet"}`}>
                  検出ピーク: 2以上 {detectedPeaks >= 2 ? "✓" : "✗"}
                </div>
                <div className={`req ${elapsedTime >= 3000 ? "met" : "unmet"}`}>
                  測定時間: 3秒以上 {elapsedTime >= 3000 ? "✓" : "✗"}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>
        {`
          .heart-rate-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            padding: 15px;
            border-radius: 10px;
            background-color: #f5f5f5;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .heart-icon {
            font-size: 2.5rem;
            margin-bottom: 10px;
            animation: pulse 1.2s ease-in-out infinite;
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }

          .heart-rate-value {
            display: flex;
            align-items: baseline;
            margin-bottom: 5px;
          }

          .measuring {
            color: #757575;
            font-style: italic;
          }

          .bpm-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #333;
          }

          .bpm-unit {
            font-size: 1.2rem;
            color: #666;
            margin-left: 5px;
          }

          .confidence-indicator {
            font-size: 0.9rem;
            margin-top: 5px;
          }
          
          .measurement-details {
            width: 100%;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 0.85rem;
          }
          
          .status-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-weight: bold;
          }
          
          .measurement-stats {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-top: 10px;
            font-size: 0.8rem;
            color: #666;
          }
          
          .measurement-stats span {
            margin: 0 5px;
          }
          
          .measurement-requirements {
            width: 100%;
            margin-top: 10px;
            font-size: 0.8rem;
          }
          
          .req {
            padding: 3px 5px;
            margin-bottom: 2px;
            border-radius: 4px;
          }
          
          .met {
            background-color: rgba(76, 175, 80, 0.1);
            color: #4caf50;
          }
          
          .unmet {
            background-color: rgba(244, 67, 54, 0.1);
            color: #f44336;
          }
        `}
      </style>
    </div>
  );
};
