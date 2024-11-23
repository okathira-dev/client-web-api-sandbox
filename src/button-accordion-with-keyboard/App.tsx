import React, { useCallback, useEffect, useState } from "react";
import { atom, useAtom } from "jotai";
import * as Tone from "tone";
import {
  KEYBOARD_LAYOUT,
  KEY_MAP,
  getFrequency,
  ifWhiteKey,
} from "./instrumentConfig";
import Slider from "@mui/material/Slider";

const buttonStatesAtom = atom<Record<string, boolean>>({});

// TODO: 音を鳴らす処理はAppコンポーネントに置きたい
// TODO: tone.jsの機能を活用して書く
// TODO: 最初に音をすべて作成しておいて、ボタンが押されたときは再生するだけにする。
Tone.setContext(new Tone.Context({ latencyHint: "interactive" }));
Tone.getContext().lookAhead = 0;

const synthAtom = atom<Tone.PolySynth | null>(null);

const Accordion: React.FC = () => {
  const [buttonStates, setButtonStates] = useAtom(buttonStatesAtom);
  const [synth, setSynth] = useAtom(synthAtom);
  const [volume, setVolume] = useState<number>(0);

  useEffect(() => {
    const newSynth = new Tone.PolySynth().toDestination();
    newSynth.volume.value = volume;
    setSynth(newSynth);
  }, [volume, setSynth]);

  const buttonDown = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined && !buttonStates[key]) {
        void Tone.start();
        const frequency = getFrequency(key);
        synth?.triggerAttack(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: true }));
      }
    },
    [buttonStates, synth, setButtonStates],
  );

  const buttonUp = useCallback(
    (key: string) => {
      const semitoneOffset = KEY_MAP[key];
      if (semitoneOffset !== undefined) {
        const frequency = getFrequency(key);
        synth?.triggerRelease(frequency);
        setButtonStates((prev) => ({ ...prev, [key]: false }));
      }
    },
    [synth, setButtonStates],
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
