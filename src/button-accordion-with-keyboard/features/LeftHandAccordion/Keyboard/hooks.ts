import { useRef, useEffect } from "react";

import {
  usePlayBassReed,
  usePlayAltoReed,
  usePlaySopranoReed,
  usePlayTenorReed,
  useStradellaReedStatesValue,
} from "../atoms/reeds";

import type { StradellaSoundType } from "../atoms/reeds";

// TODO: 同じ周波数の音が複数なっている場合に、適切に処理できていない。
// そもそもアコーディオンとしては、そのリードが鳴るか鳴らないかの状態しか無いため、同じリードの同じ音が複数鳴ることはない。
// そのため、まず同じ周波数の音が複数鳴らないように設計する必要がある。

export const usePlayActiveReeds = () => {
  const stradellaReedStates = useStradellaReedStatesValue();
  const { playReed: playSopranoReed, stopReed: stopSopranoReed } =
    usePlaySopranoReed();
  const { playReed: playAltoReed, stopReed: stopAltoReed } = usePlayAltoReed();
  const { playReed: playTenorReed, stopReed: stopTenorReed } =
    usePlayTenorReed();
  const { playReed: playBassReed, stopReed: stopBassReed } = usePlayBassReed();

  // 現在鳴っている音の周波数とその音の種類（chord/bassNote）を追跡するための参照を作成
  const activeNotesRef = useRef<Map<number, StradellaSoundType>>(new Map());
  // 前回のリードアクティベーション状態を保持
  const prevStradellaReedStatesRef = useRef(stradellaReedStates);

  // リードアクティベーションが変更されたときに、全ての鳴っている音を適切に処理
  useEffect(() => {
    const prevActivation = prevStradellaReedStatesRef.current;
    const activeNotes = Array.from(activeNotesRef.current.entries());

    // 各音について、その音の種類（chord/bassNote）に応じて処理を行う
    activeNotes.forEach(([frequency, soundType]) => {
      // リードの状態が変化したかどうかを確認し、変化があった場合のみ処理を行う
      const currentReedStates = stradellaReedStates[soundType];
      const prevReedStates = prevActivation[soundType];

      if (prevReedStates.soprano !== currentReedStates.soprano) {
        if (prevReedStates.soprano) stopSopranoReed(frequency);
        if (currentReedStates.soprano) playSopranoReed(frequency);
      }
      if (prevReedStates.alto !== currentReedStates.alto) {
        if (prevReedStates.alto) stopAltoReed(frequency);
        if (currentReedStates.alto) playAltoReed(frequency);
      }
      if (prevReedStates.tenor !== currentReedStates.tenor) {
        if (prevReedStates.tenor) stopTenorReed(frequency);
        if (currentReedStates.tenor) playTenorReed(frequency);
      }
      if (prevReedStates.bass !== currentReedStates.bass) {
        if (prevReedStates.bass) stopBassReed(frequency);
        if (currentReedStates.bass) playBassReed(frequency);
      }
    });

    prevStradellaReedStatesRef.current = stradellaReedStates;
  }, [
    stradellaReedStates,
    playSopranoReed,
    playAltoReed,
    playTenorReed,
    playBassReed,
    stopSopranoReed,
    stopAltoReed,
    stopTenorReed,
    stopBassReed,
  ]);

  const playActiveReeds = (
    frequency: number,
    soundType: StradellaSoundType,
  ) => {
    activeNotesRef.current.set(frequency, soundType);
    const reedStates = stradellaReedStates[soundType];

    if (reedStates.soprano) playSopranoReed(frequency);
    if (reedStates.alto) playAltoReed(frequency);
    if (reedStates.tenor) playTenorReed(frequency);
    if (reedStates.bass) playBassReed(frequency);
  };

  const stopActiveReeds = (
    frequency: number,
    soundType: StradellaSoundType,
  ) => {
    activeNotesRef.current.delete(frequency);
    const reedStates = stradellaReedStates[soundType];

    if (reedStates.soprano) stopSopranoReed(frequency);
    if (reedStates.alto) stopAltoReed(frequency);
    if (reedStates.tenor) stopTenorReed(frequency);
    if (reedStates.bass) stopBassReed(frequency);
  };

  return { playActiveReeds, stopActiveReeds };
};
