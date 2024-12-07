import React, { useCallback, useEffect, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  KEY_MAP,
  getFrequency,
  ifWhiteKey,
} from "../instrumentConfig";
import { usePlayActiveReeds } from "../hooks/usePlayActiveReeds";

export const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});

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
            const isWhite = ifWhiteKey(key);

            return (
              <button
                key={key}
                style={{
                  width: "48px",
                  height: "48px",
                  padding: 0,
                  borderRadius: "50%",
                  backgroundColor: isWhite ? "white" : "black",
                  color: isWhite ? "black" : "white",
                  border: "1px solid lightgray",
                  fontSize: "20px",
                  textAlign: "center",
                  lineHeight: "48px",
                  fontWeight: "bold",
                  boxShadow: buttonStates[key]
                    ? "0px 0px 6px 2px green"
                    : "none",
                }}
                onMouseDown={() => {
                  buttonDown(key);
                }}
                onMouseUp={() => {
                  buttonUp(key);
                }}
              >
                {key.toUpperCase()}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
