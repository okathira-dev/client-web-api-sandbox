import type { DetectionMode } from "../heart-rate-monitor";
import type React from "react";
import type { MutableRefObject } from "react";

interface CameraViewProps {
  videoRef: MutableRefObject<HTMLVideoElement | null>;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  detectionMode: DetectionMode;
  hasStream: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  detectionMode,
  hasStream,
}) => {
  return (
    <div className="camera-view">
      <div className={`video-container ${detectionMode}`}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display: hasStream ? "block" : "none",
            transform: "scaleX(-1)", // ミラーモード
          }}
        />

        {!hasStream && (
          <div className="no-stream">
            <p>カメラに接続していません</p>
            <p>「測定開始」ボタンを押してください</p>
          </div>
        )}

        {detectionMode === "contact" && hasStream && (
          <div className="guide-overlay">
            <div className="finger-guide" />
            <div className="processing-area" />
          </div>
        )}

        {/* 画像処理用のキャンバス - 非表示 */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      <div className="mode-indicator">
        {detectionMode === "contact" ? "接触モード" : "非接触モード"}
      </div>

      <style>
        {`
          .camera-view {
            position: relative;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .video-container {
            position: relative;
            width: 100%;
            height: 300px;
            border-radius: 10px;
            overflow: hidden;
            background-color: #111;
          }
          
          .video-container.contact {
            border: 2px solid #2196f3;
          }
          
          .video-container.non-contact {
            border: 2px solid #ff9800;
          }
          
          video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .no-stream {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: #fff;
            text-align: center;
          }
          
          .guide-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .finger-guide {
            width: 60px;
            height: 60px;
            border: 2px dashed rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            animation: pulse 1.5s infinite;
          }
          
          .processing-area {
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid rgba(255, 0, 0, 0.7);
            background-color: rgba(255, 0, 0, 0.15);
            z-index: 2;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 0.6; }
          }
          
          .mode-indicator {
            margin-top: 10px;
            text-align: center;
            font-size: 14px;
            color: #555;
          }
        `}
      </style>
    </div>
  );
};
