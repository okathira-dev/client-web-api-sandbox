import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { usePlayActiveReeds } from "./hooks";
import { getFrequency, useGetNoteLabel, isWhiteKey } from "./utils";
import {
  useRightHandBackslashPositionValue,
  useSetRightHandBackslashPosition,
  type BackslashPosition,
} from "../../../atoms/keyboardLayout";
import { KeyboardButton } from "../../../components/KeyboardButton";
import { getKeyboardLayout } from "../../../consts/keyboardLayout";

import type { KeyboardSystemType } from "./consts";
import type { KeyLabelStyle } from "./utils";
import type { SelectChangeEvent } from "@mui/material";
import type { FC, CSSProperties } from "react";

// コンポーネント外に定数を移動
const KEYBOARD_SYSTEM_SELECT_LABEL_ID = "keyboard-system-select-label";
const KEY_LABEL_STYLE_SELECT_LABEL_ID = "key-label-style-select-label";
const BACKSLASH_POSITION_SELECT_LABEL_ID = "backslash-position-select-label";

// キーボードレイアウトの定数
// ボタンの実際の幅は48px、1列下がるごとにボタン幅の半分ずつオフセット
const BUTTON_HALF_WIDTH = 24; // ボタン幅の半分（px）
const BUTTON_GAP = 2; // ボタン間のギャップ（px）
const ROW_OFFSET = BUTTON_HALF_WIDTH + BUTTON_GAP; // 1列下がるごとのオフセット（26px）
const ROW_4_OFFSET_ADJUSTMENT = -2; // 4列目（IntlBackslash用）の追加オフセット調整

// スタイル定数
const FORM_CONTAINER_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "16px",
};

const KEYBOARD_CONTAINER_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  padding: "16px",
  backgroundColor: "lightgray",
  borderRadius: "16px",
  userSelect: "none",
  WebkitUserSelect: "none",
};

export const Keyboard: FC = () => {
  // それぞれのキーの押されているかどうか（codeベース）
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  // 表示ラベルの切り替え（キーの印字か音階名か）
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("note");
  // キーボードシステムの切り替え（B-systemかC-systemか）
  const [keyboardSystemType, setKeyboardSystemType] =
    useState<KeyboardSystemType>("c-system");

  // バックスラッシュキーの位置設定
  const backslashPosition = useRightHandBackslashPositionValue();
  const setBackslashPosition = useSetRightHandBackslashPosition();

  const { t } = useTranslation();
  const getNoteLabel = useGetNoteLabel();
  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const keyboardLayout = useMemo(
    () => getKeyboardLayout(backslashPosition),
    [backslashPosition],
  );

  const buttonDown = useCallback(
    (code: string) => {
      if (!buttonStates[code]) {
        const frequency = getFrequency(
          code,
          backslashPosition,
          keyboardSystemType,
        );
        playActiveReeds(frequency);
        setButtonStates((prev) => ({ ...prev, [code]: true }));
      }
    },
    [buttonStates, backslashPosition, keyboardSystemType, playActiveReeds],
  );

  const buttonUp = useCallback(
    (code: string) => {
      const frequency = getFrequency(
        code,
        backslashPosition,
        keyboardSystemType,
      );
      stopActiveReeds(frequency);
      setButtonStates((prev) => ({ ...prev, [code]: false }));
    },
    [backslashPosition, keyboardSystemType, stopActiveReeds],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // KeyboardEvent.codeを使用して物理的なキー位置を取得
      buttonDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // KeyboardEvent.codeを使用して物理的なキー位置を取得
      buttonUp(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [buttonDown, buttonUp]);

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

  const handleBackslashPositionChange = (
    event: SelectChangeEvent<BackslashPosition>,
  ) => {
    const newPosition = event.target.value as BackslashPosition;
    if (newPosition === null) return;
    setBackslashPosition(newPosition);
    setButtonStates({}); // レイアウト切り替え時にボタンの状態をリセット
  };

  return (
    <div>
      <div style={FORM_CONTAINER_STYLE}>
        <FormControl>
          <InputLabel id={KEY_LABEL_STYLE_SELECT_LABEL_ID}>
            {t("keyboard.view.label")}
          </InputLabel>
          <Select
            labelId={KEY_LABEL_STYLE_SELECT_LABEL_ID}
            value={keyLabelStyle}
            label={t("keyboard.view.label")}
            onChange={handleKeyLabelStyleChange}
          >
            <MenuItem value="keytop">{t("keyboard.view.keytop")}</MenuItem>
            <MenuItem value="note">{t("keyboard.view.note")}</MenuItem>
            <MenuItem value="doremi">{t("keyboard.view.doremi")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id={KEYBOARD_SYSTEM_SELECT_LABEL_ID}>
            {t("keyboard.system.label")}
          </InputLabel>
          <Select
            labelId={KEYBOARD_SYSTEM_SELECT_LABEL_ID}
            value={keyboardSystemType}
            label={t("keyboard.system.label")}
            onChange={handleKeyboardSystemChange}
          >
            <MenuItem value="b-system">{t("keyboard.system.b")}</MenuItem>
            <MenuItem value="c-system">{t("keyboard.system.c")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel id={BACKSLASH_POSITION_SELECT_LABEL_ID}>
            {t("keyboard.backslashPosition.label")}
          </InputLabel>
          <Select
            labelId={BACKSLASH_POSITION_SELECT_LABEL_ID}
            value={backslashPosition}
            label={t("keyboard.backslashPosition.label")}
            onChange={handleBackslashPositionChange}
          >
            <MenuItem value="row1">
              {t("keyboard.backslashPosition.secondRow")}
            </MenuItem>
            <MenuItem value="row2">
              {t("keyboard.backslashPosition.thirdRow")}
            </MenuItem>
          </Select>
        </FormControl>
      </div>

      <div style={KEYBOARD_CONTAINER_STYLE}>
        {keyboardLayout.map((row, rowIndex) => {
          // 4列目（rowIndex === 3）は IntlBackslash があるので左にキー1個分ずらす
          const baseMargin = rowIndex * ROW_OFFSET;
          const marginLeft =
            rowIndex === 3
              ? baseMargin + ROW_4_OFFSET_ADJUSTMENT * ROW_OFFSET
              : baseMargin;

          return (
            <div
              key={rowIndex}
              style={{
                display: "flex",
                marginLeft: `${marginLeft}px`, // 行が下がるごとに右にずらす
                gap: "4px",
              }}
            >
              {row.map((code) => {
                const isWhite = isWhiteKey(
                  code,
                  backslashPosition,
                  keyboardSystemType,
                );
                const label = getNoteLabel(
                  code,
                  keyLabelStyle,
                  backslashPosition,
                  keyboardSystemType,
                );

                return (
                  <KeyboardButton
                    key={code}
                    label={label}
                    fontSize={keyLabelStyle === "doremi" ? "18px" : "20px"}
                    isWhite={isWhite}
                    isActive={!!buttonStates[code]}
                    onMouseDown={() => buttonDown(code)}
                    onMouseUp={() => buttonUp(code)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
