import React, { useCallback, useEffect, useState } from "react";
import {
  BASS_KEY_MAP,
  getBassSemitones,
  getTypeFromRow,
  StradellaType,
  getKeyLabel,
} from "../bassConfig";
import { usePlayActiveReeds } from "../hooks/usePlayActiveReeds";
import { KEYBOARD_LAYOUT, semitoneToFrequency } from "../instrumentConfig";

const bassTypeColors: Record<StradellaType, string> = {
  Counter: "#ff9800", // オレンジ
  Fundamental: "#2196f3", // ブルー
  Major: "#4caf50", // グリーン
  Minor: "#f44336", // レッド
};

export const Bass: React.FC = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const buttonDown = useCallback(
    (key: string) => {
      const position = BASS_KEY_MAP[key];
      if (position && !buttonStates[key]) {
        const semitones = getBassSemitones(position.row, position.col);
        const frequencies = semitones.map(semitoneToFrequency);
        frequencies.forEach(playActiveReeds);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, playActiveReeds],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const position = BASS_KEY_MAP[key];
      if (position) {
        const semitones = getBassSemitones(position.row, position.col);
        const frequencies = semitones.map(semitoneToFrequency);
        frequencies.forEach(stopActiveReeds);
        setButtonStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [stopActiveReeds],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      buttonDown(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      buttonUp(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [buttonDown, buttonUp]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "16px",
        backgroundColor: "lightgray",
        borderRadius: "16px",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {KEYBOARD_LAYOUT.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "flex",
            marginLeft: `${rowIndex * (24 + 2)}px`, // 行が下がるごとに右にずらす
            gap: "4px",
          }}
        >
          {row.map((key) => {
            if (key === null) return null;
            if (!(key in BASS_KEY_MAP)) return null;
            const position = BASS_KEY_MAP[key];
            if (position === undefined) return null;
            const type = getTypeFromRow(position.row);

            return (
              <button
                key={key}
                style={{
                  width: "48px",
                  height: "48px",
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: buttonStates[key]
                    ? bassTypeColors[type]
                    : "white",
                  color: buttonStates[key] ? "white" : "black",
                  border: "1px solid lightgray",
                  fontSize: "20px",
                  textAlign: "center",
                  lineHeight: "48px",
                  fontWeight: "bold",
                  boxShadow: buttonStates[key]
                    ? "0px 0px 6px 2px rgba(0,0,0,0.3)"
                    : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onMouseDown={() => buttonDown(key)}
                onMouseUp={() => buttonUp(key)}
                onMouseLeave={() => buttonStates[key] && buttonUp(key)}
              >
                {getKeyLabel(key)}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
