import React, { useCallback, useEffect, useState } from "react";
import {
  KEYBOARD_LAYOUT,
  KEY_MAP,
  getFrequency,
  getNoteLabel,
  ifWhiteKey,
} from "../instrumentConfig";
import { usePlayActiveReeds } from "../hooks/usePlayActiveReeds";
import { AccordionButton } from "./AccordionButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

export const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({});
  const [displayLabel, setDisplayLabel] = useState<"key" | "note">("note");

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

  const handleDisplayLabelChange = (
    _event: React.MouseEvent<HTMLElement>,
    newDisplayLabel: "key" | "note",
  ) => {
    if (newDisplayLabel !== null) {
      setDisplayLabel(newDisplayLabel);
    }
  };

  return (
    <div>
      <ToggleButtonGroup
        color="primary"
        value={displayLabel}
        exclusive
        onChange={handleDisplayLabelChange}
        aria-label="display label"
      >
        <ToggleButton value="key" aria-label="key">
          <Typography>Key Labels (QWERTY)</Typography>
        </ToggleButton>
        <ToggleButton value="note" aria-label="note">
          <Typography>Note Labels (C4, C#4...)</Typography>
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
              const isWhite = ifWhiteKey(key);
              const label =
                displayLabel === "key" ? key.toUpperCase() : getNoteLabel(key);

              return (
                <AccordionButton
                  key={key}
                  label={label}
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
