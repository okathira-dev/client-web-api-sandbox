import type { DetectionMode } from "../heart-rate-monitor";
import type React from "react";

interface DetectionModeSelectorProps {
  mode: DetectionMode;
  onChange: (mode: DetectionMode) => void;
  disabled: boolean;
}

export const DetectionModeSelector: React.FC<DetectionModeSelectorProps> = ({
  mode,
  onChange,
  disabled,
}) => {
  return (
    <div className="detection-mode-selector">
      <div className="mode-options">
        <button
          className={`mode-button ${mode === "contact" ? "active" : ""}`}
          onClick={() => onChange("contact")}
          disabled={disabled}
          aria-pressed={mode === "contact"}
        >
          <span className="icon">👆</span>
          <span className="label">接触モード</span>
          <span className="description">指をカメラに置く</span>
        </button>

        <button
          className={`mode-button ${mode === "non-contact" ? "active" : ""}`}
          onClick={() => onChange("non-contact")}
          disabled={disabled}
          aria-pressed={mode === "non-contact"}
        >
          <span className="icon">👤</span>
          <span className="label">非接触モード</span>
          <span className="description">顔をカメラに向ける</span>
        </button>
      </div>

      <style>
        {`
          .detection-mode-selector {
            margin-bottom: 20px;
          }
          
          .mode-options {
            display: flex;
            gap: 10px;
            justify-content: center;
          }
          
          .mode-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            background-color: #fff;
            min-width: 120px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .mode-button:hover:not(:disabled) {
            border-color: #aaa;
          }
          
          .mode-button.active {
            border-color: #2196f3;
            background-color: #e3f2fd;
          }
          
          .mode-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .icon {
            font-size: 24px;
            margin-bottom: 5px;
          }
          
          .label {
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .description {
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
};
