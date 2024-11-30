import React from "react";
import { useReedActivation } from "../atoms/reeds";
import {
  usePlayReedL1,
  usePlayReedM1,
  usePlayReedM2,
  usePlayReedM3,
  usePlayReedH1,
} from "../atoms/reeds";

export const usePlayActiveReeds = () => {
  const reedActivation = useReedActivation();
  const { playReed: playReedL1, stopReed: stopReedL1 } = usePlayReedL1();
  const { playReed: playReedM1, stopReed: stopReedM1 } = usePlayReedM1();
  const { playReed: playReedM2, stopReed: stopReedM2 } = usePlayReedM2();
  const { playReed: playReedM3, stopReed: stopReedM3 } = usePlayReedM3();
  const { playReed: playReedH1, stopReed: stopReedH1 } = usePlayReedH1();

  // 現在鳴っている音の周波数を追跡するための参照を作成
  const activeFrequenciesRef = React.useRef<Set<number>>(new Set());
  // 前回のリードアクティベーション状態を保持
  const prevReedActivationRef = React.useRef(reedActivation);

  // リードアクティベーションが変更されたときに、全ての鳴っている音を適切に処理
  React.useEffect(() => {
    const prevActivation = prevReedActivationRef.current;
    const frequencies = Array.from(activeFrequenciesRef.current);

    // 各リードについて、状態が変化した場合のみ処理を行う
    frequencies.forEach((frequency) => {
      if (prevActivation.L1 !== reedActivation.L1) {
        if (prevActivation.L1) stopReedL1(frequency);
        if (reedActivation.L1) playReedL1(frequency);
      }
      if (prevActivation.M1 !== reedActivation.M1) {
        if (prevActivation.M1) stopReedM1(frequency);
        if (reedActivation.M1) playReedM1(frequency);
      }
      if (prevActivation.M2 !== reedActivation.M2) {
        if (prevActivation.M2) stopReedM2(frequency);
        if (reedActivation.M2) playReedM2(frequency);
      }
      if (prevActivation.M3 !== reedActivation.M3) {
        if (prevActivation.M3) stopReedM3(frequency);
        if (reedActivation.M3) playReedM3(frequency);
      }
      if (prevActivation.H1 !== reedActivation.H1) {
        if (prevActivation.H1) stopReedH1(frequency);
        if (reedActivation.H1) playReedH1(frequency);
      }
    });

    prevReedActivationRef.current = reedActivation;
  }, [
    reedActivation,
    playReedL1,
    playReedM1,
    playReedM2,
    playReedM3,
    playReedH1,
    stopReedL1,
    stopReedM1,
    stopReedM2,
    stopReedM3,
    stopReedH1,
  ]);

  const playActiveReeds = (frequency: number) => {
    activeFrequenciesRef.current.add(frequency);
    if (reedActivation.L1) playReedL1(frequency);
    if (reedActivation.M1) playReedM1(frequency);
    if (reedActivation.M2) playReedM2(frequency);
    if (reedActivation.M3) playReedM3(frequency);
    if (reedActivation.H1) playReedH1(frequency);
  };

  const stopActiveReeds = (frequency: number) => {
    activeFrequenciesRef.current.delete(frequency);
    if (reedActivation.L1) stopReedL1(frequency);
    if (reedActivation.M1) stopReedM1(frequency);
    if (reedActivation.M2) stopReedM2(frequency);
    if (reedActivation.M3) stopReedM3(frequency);
    if (reedActivation.H1) stopReedH1(frequency);
  };

  return { playActiveReeds, stopActiveReeds };
};
