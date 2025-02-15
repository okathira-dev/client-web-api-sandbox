import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { usePlayActiveReeds } from "./hooks";
import {
  getKeyboardLayout,
  getFrequencies,
  getKeyLabel,
  getTypeFromRow,
  getKeyMap,
  getStradellaSoundType,
} from "./utils";

import type { KeyboardLayoutType } from "./consts";
import type { StradellaType } from "../types";
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
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("note");
  const [keyboardLayoutType, setKeyboardLayoutType] =
    useState<KeyboardLayoutType>("en");

  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const keyMap = getKeyMap(keyboardLayoutType);
  const keyboardLayout = getKeyboardLayout(keyboardLayoutType);

  const buttonDown = useCallback(
    (key: string) => {
      const frequencies = getFrequencies(key, keyboardLayoutType);
      const stradellaSoundType = getStradellaSoundType(key, keyboardLayoutType);

      if (!buttonStates[key] && frequencies && stradellaSoundType) {
        frequencies.forEach((frequency: number) => {
          playActiveReeds(frequency, stradellaSoundType);
        });
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, keyboardLayoutType, playActiveReeds],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const frequencies = getFrequencies(key, keyboardLayoutType);
      const stradellaSoundType = getStradellaSoundType(key, keyboardLayoutType);

      if (frequencies && stradellaSoundType) {
        frequencies.forEach((frequency: number) => {
          stopActiveReeds(frequency, stradellaSoundType);
        });
      }
      setButtonStates((prev) => ({ ...prev, [key]: false }));
    },
    [keyboardLayoutType, stopActiveReeds],
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

  const handleKeyboardLayoutChange = (
    event: SelectChangeEvent<KeyboardLayoutType>,
  ) => {
    const newKeyboardLayoutType = event.target.value as KeyboardLayoutType;
    if (newKeyboardLayoutType === null) return;
    setKeyboardLayoutType(newKeyboardLayoutType);
    setButtonStates({}); // レイアウト切り替え時にボタンの状態をリセット
  };

  const keyboardLayoutSelectLabelId = "keyboard-layout-select-label";

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
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
        <FormControl>
          <InputLabel id={keyboardLayoutSelectLabelId}>
            キーボードレイアウト
          </InputLabel>
          <Select
            labelId={keyboardLayoutSelectLabelId}
            value={keyboardLayoutType}
            label="キーボードレイアウト"
            onChange={handleKeyboardLayoutChange}
          >
            <MenuItem value="en">英語キーボード</MenuItem>
            <MenuItem value="ja">日本語キーボード</MenuItem>
          </Select>
        </FormControl>
      </div>
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
        {keyboardLayout.map((row, rowIndex) => (
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
              const position = keyMap[key];
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
                    ? getKeyLabel(key, keyboardLayoutType)
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
