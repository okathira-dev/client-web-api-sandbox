import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePlayActiveReeds } from "./hooks";
import {
  getFrequency,
  getNoteLabel,
  getKeyboardLayout,
  isWhiteKey,
} from "./utils";
import { KeyboardButton } from "../../../components/KeyboardButton";

import type { KeyboardLayoutType } from "./consts";
import type { KeyLabelStyle } from "./utils";
import type { SelectChangeEvent } from "@mui/material";
import type { FC, MouseEvent } from "react";

export const Keyboard: FC = () => {
  // それぞれのキーの押されているかどうか
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  // 表示ラベルの切り替え（キーの印字か音階名か）
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("en");
  // キーボードレイアウトの切り替え（USかJISか）
  const [keyboardLayoutType, setKeyboardLayoutType] =
    useState<KeyboardLayoutType>("en");

  const { t } = useTranslation();
  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const keyboardLayout = getKeyboardLayout(keyboardLayoutType);

  const buttonDown = useCallback(
    (key: string) => {
      if (!buttonStates[key]) {
        const frequency = getFrequency(key, keyboardLayoutType);
        playActiveReeds(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, keyboardLayoutType, playActiveReeds],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const frequency = getFrequency(key, keyboardLayoutType);
      stopActiveReeds(frequency);
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

  const handleKeyboardLayoutChange = (
    event: SelectChangeEvent<KeyboardLayoutType>,
  ) => {
    const newKeyboardLayoutType = event.target.value as KeyboardLayoutType;
    if (newKeyboardLayoutType === null) return;
    setKeyboardLayoutType(newKeyboardLayoutType);
    setButtonStates({}); // レイアウト切り替え時にボタンの状態をリセット
  };

  const handleKeyLabelStyleChange = (
    _event: MouseEvent<HTMLElement>,
    newKeyLabelStyle: KeyLabelStyle | null,
  ) => {
    if (newKeyLabelStyle === null) return; // 常にどれか一つは選択されているようにする
    setKeyLabelStyle(newKeyLabelStyle);
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
          aria-label={t("keyboard.tabs.label")}
        >
          <ToggleButton value="key">
            <Typography>{t("keyboard.tabs.key")}</Typography>
          </ToggleButton>
          <ToggleButton value="en">
            <Typography>{t("keyboard.tabs.en")}</Typography>
          </ToggleButton>
          <ToggleButton value="ja">
            <Typography>{t("keyboard.tabs.ja")}</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
        <FormControl>
          <InputLabel id={keyboardLayoutSelectLabelId}>
            {t("keyboard.layout.label")}
          </InputLabel>
          <Select
            labelId={keyboardLayoutSelectLabelId}
            value={keyboardLayoutType}
            label={t("keyboard.layout.label")}
            onChange={handleKeyboardLayoutChange}
          >
            <MenuItem value="en">{t("keyboard.layout.en")}</MenuItem>
            <MenuItem value="ja">{t("keyboard.layout.ja")}</MenuItem>
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
              const isWhite = isWhiteKey(key, keyboardLayoutType);
              const label = getNoteLabel(
                key,
                keyLabelStyle,
                keyboardLayoutType,
              );

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
