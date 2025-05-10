import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { usePlayActiveReeds } from "./hooks";
import {
  getFrequency,
  useGetNoteLabel,
  getKeyboardLayout,
  isWhiteKey,
} from "./utils";
import { KeyboardButton } from "../../../components/KeyboardButton";

import type { KeyboardLayoutType, KeyboardSystemType } from "./consts";
import type { KeyLabelStyle } from "./utils";
import type { SelectChangeEvent } from "@mui/material";
import type { FC } from "react";

export const Keyboard: FC = () => {
  // それぞれのキーの押されているかどうか
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  // 表示ラベルの切り替え（キーの印字か音階名か）
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("en");
  // キーボードレイアウトの切り替え（USかJISか）
  const [keyboardLayoutType, setKeyboardLayoutType] =
    useState<KeyboardLayoutType>("en");
  // キーボードシステムの切り替え（B-systemかC-systemか）
  const [keyboardSystemType, setKeyboardSystemType] =
    useState<KeyboardSystemType>("c-system");

  const { t } = useTranslation();
  const getNoteLabel = useGetNoteLabel();
  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const keyboardLayout = getKeyboardLayout(keyboardLayoutType);

  const buttonDown = useCallback(
    (key: string) => {
      if (!buttonStates[key]) {
        const frequency = getFrequency(
          key,
          keyboardLayoutType,
          keyboardSystemType,
        );
        playActiveReeds(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, keyboardLayoutType, keyboardSystemType, playActiveReeds],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const frequency = getFrequency(
        key,
        keyboardLayoutType,
        keyboardSystemType,
      );
      stopActiveReeds(frequency);
      setButtonStates((prev) => ({ ...prev, [key]: false }));
    },
    [keyboardLayoutType, keyboardSystemType, stopActiveReeds],
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

  const handleKeyboardSystemChange = (
    event: SelectChangeEvent<KeyboardSystemType>,
  ) => {
    const newKeyboardSystemType = event.target.value as KeyboardSystemType;
    if (newKeyboardSystemType === null) return;
    setKeyboardSystemType(newKeyboardSystemType);
    setButtonStates({}); // システム切り替え時にボタンの状態をリセット
  };

  const handleKeyLabelStyleChange = (
    event: SelectChangeEvent<KeyLabelStyle>,
  ) => {
    const newKeyLabelStyle = event.target.value as KeyLabelStyle;
    if (newKeyLabelStyle === null) return;
    setKeyLabelStyle(newKeyLabelStyle);
  };

  const keyboardLayoutSelectLabelId = "keyboard-layout-select-label";
  const keyboardSystemSelectLabelId = "keyboard-system-select-label";
  const keyLabelStyleSelectLabelId = "key-label-style-select-label";

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
        }}
      >
        <FormControl>
          <InputLabel id={keyLabelStyleSelectLabelId}>
            {t("keyboard.view.label")}
          </InputLabel>
          <Select
            labelId={keyLabelStyleSelectLabelId}
            value={keyLabelStyle}
            label={t("keyboard.view.label")}
            onChange={handleKeyLabelStyleChange}
          >
            <MenuItem value="keytop">{t("keyboard.view.keytop")}</MenuItem>
            <MenuItem value="en">{t("keyboard.view.en")}</MenuItem>
            <MenuItem value="doremi">{t("keyboard.view.doremi")}</MenuItem>
          </Select>
        </FormControl>
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
        <FormControl>
          <InputLabel id={keyboardSystemSelectLabelId}>
            {t("keyboard.system.label")}
          </InputLabel>
          <Select
            labelId={keyboardSystemSelectLabelId}
            value={keyboardSystemType}
            label={t("keyboard.system.label")}
            onChange={handleKeyboardSystemChange}
          >
            <MenuItem value="c-system">{t("keyboard.system.c")}</MenuItem>
            <MenuItem value="b-system">{t("keyboard.system.b")}</MenuItem>
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
              const isWhite = isWhiteKey(
                key,
                keyboardLayoutType,
                keyboardSystemType,
              );
              const label = getNoteLabel(
                key,
                keyLabelStyle,
                keyboardLayoutType,
                keyboardSystemType,
              );

              return (
                <KeyboardButton
                  key={key}
                  label={label}
                  fontSize={keyLabelStyle === "doremi" ? "18px" : "20px"}
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
