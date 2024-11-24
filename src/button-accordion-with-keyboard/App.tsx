import React, { useCallback, useEffect } from "react";
import { atom, useAtom } from "jotai";
import {
  KEYBOARD_LAYOUT,
  KEY_MAP,
  getFrequency,
  ifWhiteKey,
} from "./instrumentConfig";
import Slider from "@mui/material/Slider";
import {
  initReeds,
  usePlayReedM1,
  useSetReedM1Volume,
  useSetVolume,
  useVolume,
} from "./reedAtoms";

const buttonStatesAtom = atom<Record<string, boolean>>({});

const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useAtom(buttonStatesAtom);

  const volume = useVolume();
  const setVolume = useSetVolume();
  const { playReedM1, stopReedM1 } = usePlayReedM1();
  const setReedM1Volume = useSetReedM1Volume();

  setReedM1Volume(volume);

  // init sound system
  useEffect(() => {
    initReeds();
  }, []);

  const buttonDown = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined && !buttonStates[key]) {
        const frequency = getFrequency(key);
        playReedM1(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, playReedM1, setButtonStates],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined) {
        const frequency = getFrequency(key);
        stopReedM1(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [setButtonStates, stopReedM1],
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
      }}
    >
      <Slider
        value={volume}
        onChange={(_, newValue) => {
          const newVolume = newValue as number;
          setVolume(newVolume);
        }}
        aria-labelledby="volume-slider"
        min={-60}
        max={0}
        step={1}
        valueLabelDisplay="auto"
      />
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

export function App() {
  return (
    <div
      // 画面の中央に配置する
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Accordion />
    </div>
  );
}
