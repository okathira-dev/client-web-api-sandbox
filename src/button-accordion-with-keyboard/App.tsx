import React, { useCallback, useEffect } from "react";
import { atom, useAtom } from "jotai";
import {
  KEYBOARD_LAYOUT,
  KEY_MAP,
  getFrequency,
  ifWhiteKey,
} from "./instrumentConfig";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import {
  initReeds,
  useSetVolume,
  useVolume,
  useRelativeReedPitches,
  useSetRelativeReedPitches,
  reedNames,
  useAdaptAllReedPitches,
  useAdaptAllReedVolumes,
  usePlayActiveReeds,
} from "./reeds";

const buttonStatesAtom = atom<Record<string, boolean>>({});

const VolumeControl: React.FC = () => {
  const volume = useVolume();
  const setVolume = useSetVolume();

  const adaptAllReedVolumes = useAdaptAllReedVolumes();
  adaptAllReedVolumes(); // CHECK: ボリュームの更新

  return (
    <div style={{ width: "700px" }}>
      <label>
        Volume
        <Slider
          value={volume}
          onChange={(_, newValue) => {
            const newVolume = newValue as number;
            setVolume(newVolume);
          }}
          min={-60}
          max={0}
          step={1}
          valueLabelDisplay="auto"
        />
      </label>
    </div>
  );
};

const ReedPitchControls: React.FC = () => {
  const relativeReedPitches = useRelativeReedPitches();
  const setRelativeReedPitches = useSetRelativeReedPitches();

  const adaptAllReedPitches = useAdaptAllReedPitches();
  adaptAllReedPitches(); // CHECK: ピッチの更新

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      {reedNames.map((reed) => (
        <div
          key={reed}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>{reed}</span>
          <TextField
            type="number"
            value={relativeReedPitches[reed]}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10);
              setRelativeReedPitches((prev) => ({
                ...prev,
                [reed]: isNaN(newValue) ? prev[reed] : newValue,
              }));
            }}
            slotProps={{ htmlInput: { min: -2500, max: 2500, step: 1 } }}
            aria-labelledby={`${reed}-pitch-input`}
          />
        </div>
      ))}
    </div>
  );
};

const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useAtom(buttonStatesAtom);

  const { playActiveReeds, stopActiveReeds } = usePlayActiveReeds();

  // init sound system
  useEffect(() => {
    console.log("context is set", initReeds());
  }, []);

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

export function App() {
  return (
    <div
      // 画面の中央に配置する
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <VolumeControl />
      <ReedPitchControls />
      <Accordion />
    </div>
  );
}
