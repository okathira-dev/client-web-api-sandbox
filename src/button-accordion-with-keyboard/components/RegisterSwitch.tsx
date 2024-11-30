import React, { useCallback, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  useSelectedPreset,
  useSetSelectedPreset,
  useAdoptPreset,
  useReedActivation,
  reedActivationPresets,
} from "../atoms/reeds";

// 音色切り替えスイッチ
export const RegisterSwitch: React.FC = () => {
  const selectedPreset = useSelectedPreset();
  const setSelectedPreset = useSetSelectedPreset();
  const adaptPreset = useAdoptPreset();
  const reedActivation = useReedActivation();

  const handlePresetChange = useCallback(
    (index: number) => {
      setSelectedPreset(index);
      adaptPreset(index);
    },
    [setSelectedPreset, adaptPreset],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("F") && !isNaN(Number(e.key.slice(1)))) {
        const presetIndex = Number(e.key.slice(1)) - 1;
        if (presetIndex >= 0 && presetIndex < 12) {
          e.preventDefault(); // ファンクションキーのデフォルトの動作を無効化
          handlePresetChange(presetIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePresetChange]);

  const buttonPressedMargin = "4px";

  return (
    <div
      style={{ display: "flex", gap: "2px", marginBottom: buttonPressedMargin }}
    >
      {reedActivationPresets.map((preset, index) => {
        const isActive =
          JSON.stringify(preset) === JSON.stringify(reedActivation);
        return (
          <Button
            key={index}
            onClick={() => handlePresetChange(index)}
            variant="contained"
            color={selectedPreset === index && isActive ? "primary" : "inherit"}
            style={{
              width: "56px",
              minWidth: "56px",
              height: "96px",
              borderRadius: "8px",
              padding: "2px",
              fontSize: "16px",
              textAlign: "center",
              lineHeight: "16px",
              fontWeight: "bold",
              boxShadow:
                selectedPreset === index && isActive
                  ? "inset 0px 0px 6px 2px black"
                  : "none",
              transform:
                selectedPreset === index && isActive
                  ? `translateY(${buttonPressedMargin})`
                  : "none",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "center",
              opacity: isActive ? 1 : 0.5,
            }}
          >
            <span>F{index + 1}</span>
            <span
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "2px",
              }}
            >
              {/* 
                H_1_
                M123
                L_1_          
              */}
              <span>H</span>
              <span></span>
              <span>{preset.H1 && "1"}</span>
              <span></span>
              <span>M</span>
              <span>{preset.M1 && "1"}</span>
              <span>{preset.M2 && "2"}</span>
              <span>{preset.M3 && "3"}</span>
              <span>L</span>
              <span></span>
              <span>{preset.L1 && "1"}</span>
              <span></span>
            </span>
          </Button>
        );
      })}
    </div>
  );
};
