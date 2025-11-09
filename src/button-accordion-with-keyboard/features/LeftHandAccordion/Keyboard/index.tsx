import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { usePlayActiveReeds } from "./hooks";
import {
  getFrequencies,
  getKeyLabel,
  getTypeFromRow,
  getStradellaSoundType,
} from "./utils";
import {
  useLeftHandBackslashPositionValue,
  useSetLeftHandBackslashPosition,
  type BackslashPosition,
} from "../../../atoms/keyboardLayout";
import {
  PHYSICAL_KEYBOARD_MAP,
  BACKSLASH_POSITIONS,
  getKeyboardLayout,
} from "../../../consts/keyboardLayout";

import type { StradellaType } from "../types";
import type { CSSProperties } from "react";

type KeyLabelStyle = "keytop" | "note";

// コンポーネント外に定数を移動
const KEY_LABEL_STYLE_SELECT_LABEL_ID = "key-label-style-select-label";
const BACKSLASH_POSITION_SELECT_LABEL_ID = "backslash-position-select-label";

const BASS_TYPE_COLORS = {
  counter: "#ff9800", // オレンジ
  fundamental: "#2196f3", // ブルー
  major: "#4caf50", // グリーン
  minor: "#f44336", // レッド
} as const satisfies Record<StradellaType, string>;

// スタイル定数
const FORM_CONTAINER_STYLE: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
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

const BUTTON_BASE_STYLE: CSSProperties = {
  width: "48px",
  height: "48px",
  padding: 0,
  borderRadius: "50%",
  border: "1px solid lightgray",
  fontSize: "20px",
  textAlign: "center",
  lineHeight: "48px",
  fontWeight: "bold",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

export const Keyboard = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [keyLabelStyle, setKeyLabelStyle] = useState<KeyLabelStyle>("note");

  // バックスラッシュキーの位置設定
  const backslashPosition = useLeftHandBackslashPositionValue();
  const setBackslashPosition = useSetLeftHandBackslashPosition();

  const { t } = useTranslation();
  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  const keyboardLayout = useMemo(
    () => getKeyboardLayout(backslashPosition),
    [backslashPosition],
  );

  const buttonDown = useCallback(
    (code: string) => {
      const frequencies = getFrequencies(code, backslashPosition);
      const stradellaSoundType = getStradellaSoundType(code, backslashPosition);

      if (!buttonStates[code] && frequencies && stradellaSoundType) {
        frequencies.forEach((frequency: number) => {
          playActiveReeds(frequency, stradellaSoundType);
        });
        setButtonStates((prev) => ({ ...prev, [code]: true }));
      }
    },
    [buttonStates, backslashPosition, playActiveReeds],
  );

  const buttonUp = useCallback(
    (code: string) => {
      const frequencies = getFrequencies(code, backslashPosition);
      const stradellaSoundType = getStradellaSoundType(code, backslashPosition);

      if (frequencies && stradellaSoundType) {
        frequencies.forEach((frequency: number) => {
          stopActiveReeds(frequency, stradellaSoundType);
        });
      }
      setButtonStates((prev) => ({ ...prev, [code]: false }));
    },
    [backslashPosition, stopActiveReeds],
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
          const baseMargin = rowIndex * (24 + 2);
          const marginLeft =
            rowIndex === 3 ? baseMargin - (24 + 2) * 2 : baseMargin;

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
                const label = getKeyLabel(
                  code,
                  keyLabelStyle,
                  backslashPosition,
                );
                const frequencies = getFrequencies(code, backslashPosition);
                if (!frequencies) return null;

                const stradellaSoundType = getStradellaSoundType(
                  code,
                  backslashPosition,
                );
                if (!stradellaSoundType) return null;

                // row情報を取得してタイプを判定
                const codePosition =
                  code === "Backslash"
                    ? BACKSLASH_POSITIONS[backslashPosition]
                    : PHYSICAL_KEYBOARD_MAP[code];
                if (!codePosition) return null;
                const type = getTypeFromRow(codePosition.row);

                const isActive = buttonStates[code];
                const buttonStyle = {
                  ...BUTTON_BASE_STYLE,
                  backgroundColor: isActive ? BASS_TYPE_COLORS[type] : "white",
                  color: isActive ? "white" : "black",
                  boxShadow: isActive
                    ? "0px 0px 6px 2px rgba(0,0,0,0.3)"
                    : "none",
                };

                return (
                  <button
                    key={code}
                    style={buttonStyle}
                    onMouseDown={() => buttonDown(code)}
                    onMouseUp={() => buttonUp(code)}
                    onMouseLeave={() => isActive && buttonUp(code)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
