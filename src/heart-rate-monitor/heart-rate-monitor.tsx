import { useState } from "react";

import { CameraView } from "./components/CameraView";
import { DetectionModeSelector } from "./components/DetectionModeSelector";
import { HeartRateDisplay } from "./components/HeartRateDisplay";
import { useCameraStream } from "./hooks/useCameraStream";
import { useHeartRateDetection } from "./hooks/useHeartRateDetection";

import type React from "react";

export type DetectionMode = "contact" | "non-contact";

export const HeartRateMonitor: React.FC = () => {
  const [detectionMode, setDetectionMode] = useState<DetectionMode>("contact");
  const [isRunning, setIsRunning] = useState(false);

  const {
    videoRef,
    canvasRef,
    hasStream,
    startCamera,
    stopCamera,
    toggleFlashlight,
  } = useCameraStream();

  const {
    heartRate,
    confidence,
    startDetection,
    stopDetection,
    status,
    dataPoints,
    detectedPeaks,
    elapsedTime,
  } = useHeartRateDetection(videoRef, canvasRef, detectionMode);

  const handleStart = async () => {
    await startCamera();
    startDetection();
    setIsRunning(true);
  };

  const handleStop = () => {
    stopDetection();
    stopCamera();
    setIsRunning(false);
  };

  const handleModeChange = (mode: DetectionMode) => {
    if (isRunning) {
      handleStop();
    }
    setDetectionMode(mode);
  };

  return (
    <div className="heart-rate-monitor">
      <h1>心拍モニター</h1>

      <DetectionModeSelector
        mode={detectionMode}
        onChange={handleModeChange}
        disabled={isRunning}
      />

      <div className="camera-container">
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          detectionMode={detectionMode}
          hasStream={hasStream}
        />
      </div>

      <HeartRateDisplay
        heartRate={heartRate}
        confidence={confidence}
        status={status}
        dataPoints={dataPoints}
        detectedPeaks={detectedPeaks}
        elapsedTime={elapsedTime}
      />

      <div className="controls">
        {!isRunning ? (
          <button
            onClick={() => {
              void handleStart();
            }}
          >
            測定開始
          </button>
        ) : (
          <button onClick={handleStop}>測定停止</button>
        )}

        {detectionMode === "contact" && hasStream && (
          <button
            onClick={() => {
              void toggleFlashlight();
            }}
          >
            ライト切替
          </button>
        )}
      </div>

      {detectionMode === "contact" && (
        <div className="instructions">
          <p>
            指先をカメラに置いてください。可能であれば、フラッシュをオンにすることで精度が向上します。
          </p>
          <ul className="measurement-tips">
            <li>カメラレンズに指を軽く押し当ててください</li>
            <li>赤色の四角形が表示されている部分が測定エリアです</li>
            <li>測定中は指を動かさないでください</li>
            <li>最低3秒間の測定が必要です</li>
          </ul>
        </div>
      )}

      {detectionMode === "non-contact" && (
        <div className="instructions">
          <p>
            顔をカメラに向けて静止してください。明るい環境で測定することをお勧めします。
          </p>
        </div>
      )}

      <style>
        {`
          .measurement-tips {
            margin-top: 10px;
            font-size: 0.9rem;
            color: #555;
            text-align: left;
          }
          
          .measurement-tips li {
            margin-bottom: 5px;
          }
        `}
      </style>
    </div>
  );
};

export default HeartRateMonitor;
