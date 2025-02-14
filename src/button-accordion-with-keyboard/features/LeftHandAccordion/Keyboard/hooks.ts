import { useRef, useEffect } from "react";

import {
  usePlayBassReed,
  usePlayAltoReed,
  usePlaySopranoReed,
  usePlayTenorReed,
  useStradellaReedStatesValue,
} from "../atoms/reeds";

import type { StradellaSoundType } from "../atoms/reeds";

export const usePlayActiveReeds = () => {
  const stradellaReedStates = useStradellaReedStatesValue();
  const { playReed: playSopranoReed, stopReed: stopSopranoReed } =
    usePlaySopranoReed();
  const { playReed: playAltoReed, stopReed: stopAltoReed } = usePlayAltoReed();
  const { playReed: playTenorReed, stopReed: stopTenorReed } =
    usePlayTenorReed();
  const { playReed: playBassReed, stopReed: stopBassReed } = usePlayBassReed();

  // 現在鳴っている音の周波数を追跡するための参照を作成
  const activeFrequenciesRef = useRef<Set<number>>(new Set());
  // 前回のリードアクティベーション状態を保持
  const prevStradellaReedStatesRef = useRef(stradellaReedStates);

  // リードアクティベーションが変更されたときに、全ての鳴っている音を適切に処理
  useEffect(() => {
    const prevActivation = prevStradellaReedStatesRef.current;
    const frequencies = Array.from(activeFrequenciesRef.current);

    // TODO: bassNote と chord についていい感じに処理する
    // 各リードについて、状態が変化した場合のみ処理を行う
    frequencies.forEach((frequency) => {
      // 先に bassNote をまとめて処理
      if (
        prevActivation.bassNote.soprano !== stradellaReedStates.bassNote.soprano
      ) {
        if (prevActivation.bassNote.soprano) stopSopranoReed(frequency);
        if (stradellaReedStates.bassNote.soprano) playSopranoReed(frequency);
      }
      if (prevActivation.bassNote.alto !== stradellaReedStates.bassNote.alto) {
        if (prevActivation.bassNote.alto) stopAltoReed(frequency);
        if (stradellaReedStates.bassNote.alto) playAltoReed(frequency);
      }
      if (
        prevActivation.bassNote.tenor !== stradellaReedStates.bassNote.tenor
      ) {
        if (prevActivation.bassNote.tenor) stopTenorReed(frequency);
        if (stradellaReedStates.bassNote.tenor) playTenorReed(frequency);
      }
      if (prevActivation.bassNote.bass !== stradellaReedStates.bassNote.bass) {
        if (prevActivation.bassNote.bass) stopBassReed(frequency);
        if (stradellaReedStates.bassNote.bass) playBassReed(frequency);
      }
      // 次に chord をまとめて処理
      if (prevActivation.chord.soprano !== stradellaReedStates.chord.soprano) {
        if (prevActivation.chord.soprano) stopSopranoReed(frequency);
        if (stradellaReedStates.chord.soprano) playSopranoReed(frequency);
      }
      if (prevActivation.chord.alto !== stradellaReedStates.chord.alto) {
        if (prevActivation.chord.alto) stopAltoReed(frequency);
        if (stradellaReedStates.chord.alto) playAltoReed(frequency);
      }
      if (prevActivation.chord.tenor !== stradellaReedStates.chord.tenor) {
        if (prevActivation.chord.tenor) stopTenorReed(frequency);
        if (stradellaReedStates.chord.tenor) playTenorReed(frequency);
      }
      if (prevActivation.chord.bass !== stradellaReedStates.chord.bass) {
        if (prevActivation.chord.bass) stopBassReed(frequency);
        if (stradellaReedStates.chord.bass) playBassReed(frequency);
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
    activeFrequenciesRef.current.add(frequency);
    if (stradellaReedStates[soundType].soprano) playSopranoReed(frequency);
    if (stradellaReedStates[soundType].alto) playAltoReed(frequency);
    if (stradellaReedStates[soundType].tenor) playTenorReed(frequency);
    if (stradellaReedStates[soundType].bass) playBassReed(frequency);
  };

  const stopActiveReeds = (
    frequency: number,
    soundType: StradellaSoundType,
  ) => {
    activeFrequenciesRef.current.delete(frequency);
    if (stradellaReedStates[soundType].soprano) stopSopranoReed(frequency);
    if (stradellaReedStates[soundType].alto) stopAltoReed(frequency);
    if (stradellaReedStates[soundType].tenor) stopTenorReed(frequency);
    if (stradellaReedStates[soundType].bass) stopBassReed(frequency);
  };

  return { playActiveReeds, stopActiveReeds };
};
