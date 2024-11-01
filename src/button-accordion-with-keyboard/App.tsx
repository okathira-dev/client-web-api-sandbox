import React, { useCallback, useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import * as Tone from "tone";
import { KEYBOARD_LAYOUT, KEY_MAP, ifWhiteKey } from "./instrumentConfig";
import Slider from "@mui/material/Slider";

const buttonStatesAtom = atom<Record<string, boolean>>({});

const concertPitch = 440; // A4の周波数[Hz]

// TODO: 音を鳴らす処理はAppコンポーネントに置きたい
// TODO: tone.jsの機能を活用して書く
const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useAtom(buttonStatesAtom);
  const [synths, setSynths] = useState<{ [key: string]: Tone.Synth }>({});
  const [volume, setVolume] = useState<number>(0);

  const initSynth = useCallback(
    (key: string, semitones: number) => {
      const synth = new Tone.Synth().toDestination();
      synth.volume.value = volume;
      const frequency = Tone.Frequency(
        concertPitch * Math.pow(2, semitones / 12),
      ).toFrequency();
      synth.triggerAttack(frequency);
      setSynths((prev) => ({ ...prev, [key]: synth }));
    },
    [volume],
  );

  const stopSynth = useCallback(
    (key: string) => {
      const synth = synths[key];
      if (synth) {
        synth.triggerRelease();
        delete synths[key];
        setSynths({ ...synths });
      }
    },
    [synths],
  );

  const buttonDown = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined && !buttonStates[key]) {
        void Tone.start();
        initSynth(key, semitoneOffset);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, initSynth, setButtonStates],
  );

  const buttonUp = useCallback(
    (key: string) => {
      stopSynth(key);
      setButtonStates((prev) => ({ ...prev, [key]: false }));
    },
    [setButtonStates, stopSynth],
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
        onChange={(_, newValue) => setVolume(newValue as number)}
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
