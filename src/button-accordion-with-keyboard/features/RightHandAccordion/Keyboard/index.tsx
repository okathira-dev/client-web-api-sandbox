import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { KEYBOARD_LAYOUT, KEY_MAP } from "./consts";
import { usePlayActiveReeds } from "./hooks";
import { getFrequency, getNoteLabel, isWhiteKey } from "./utils";
import { KeyboardButton } from "../../../components/KeyboardButton";

import type { KeyLabelStyle } from "./utils";
import type { FC, MouseEvent } from "react";

export const Keyboard: FC = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("en");

  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const buttonDown = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined && !buttonStates[key]) {
        const frequency = getFrequency(key);
        playActiveReeds(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, playActiveReeds, setButtonStates],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined) {
        const frequency = getFrequency(key);
        stopActiveReeds(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [setButtonStates, stopActiveReeds],
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
        aria-label="display label"
      >
        <ToggleButton value="key" aria-label="key">
          <Typography>Key Labels (QWERTY)</Typography>
        </ToggleButton>
        <ToggleButton value="en" aria-label="note en">
          <Typography>Note Labels (C4, C#4...)</Typography>
        </ToggleButton>
        <ToggleButton value="ja" aria-label="note ja">
          <Typography>Note Labels (ドレミ)</Typography>
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
              const isWhite = isWhiteKey(key);
              const label = getNoteLabel(key, keyLabelStyle);

              return (
                <KeyboardButton
                  key={key}
                  label={label}
                  fontSize={keyLabelStyle === "ja" ? "18px" : "20px"}
                  isWhite={isWhite}
                  isActive={!!buttonStates[key]}
                  onMouseDown={() => buttonDown(key)}
                  onMouseUp={() => buttonUp(key)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
