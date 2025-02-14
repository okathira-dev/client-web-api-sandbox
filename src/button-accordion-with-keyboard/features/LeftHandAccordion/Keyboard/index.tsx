import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { KEYBOARD_LAYOUT, KEY_MAP } from "./consts";
import { usePlayActiveReeds } from "./hooks";
import {
  getFrequencies,
  getKeyLabel,
  getStradellaSoundType,
  getTypeFromRow,
} from "./utils";

import type { StradellaType } from "./consts";
import type { MouseEvent } from "react";

type KeyLabelStyle = "key" | "note";

const bassTypeColors: Record<StradellaType, string> = {
  counter: "#ff9800", // オレンジ
  fundamental: "#2196f3", // ブルー
  major: "#4caf50", // グリーン
  minor: "#f44336", // レッド
};

export const Keyboard = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("key");

  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const buttonDown = useCallback(
    (key: string) => {
      const frequencies = getFrequencies(key);
      const soundType = getStradellaSoundType(key);

      if (!buttonStates[key] && frequencies && soundType) {
        frequencies.forEach((frequency: number) => {
          playActiveReeds(frequency, soundType);
        });
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, playActiveReeds],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const frequencies = getFrequencies(key);
      const soundType = getStradellaSoundType(key);

      if (frequencies && soundType) {
        frequencies.forEach((frequency: number) => {
          stopActiveReeds(frequency, soundType);
        });
      }
      setButtonStates((prev) => ({ ...prev, [key]: false }));
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

  const handleKeyLabelStyleChange = (
    _event: MouseEvent<HTMLElement>,
    newKeyLabelStyle: KeyLabelStyle | null,
  ) => {
    if (newKeyLabelStyle === null) return; // 常にどれか一つは選択されているようにする
    setKeyLabelStyle(newKeyLabelStyle);
  };

  return (
    <div>
      <ToggleButtonGroup
        color="primary"
        value={keyLabelStyle}
        exclusive
        onChange={handleKeyLabelStyleChange}
        aria-label="表示ラベルの切り替え"
      >
        <ToggleButton value="key">
          <Typography>キーボード (QWERTY)</Typography>
        </ToggleButton>
        <ToggleButton value="note">
          <Typography>音階 (C4, C#4, D4...)</Typography>
        </ToggleButton>
      </ToggleButtonGroup>
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
              if (!(key in KEY_MAP)) return null;
              const position = KEY_MAP[key];
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
                  {keyLabelStyle === "note"
                    ? getKeyLabel(key)
                    : key.toUpperCase()}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
