import React from "react";
import {
  useReedActivation,
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
      if (prevActivation.LOW !== reedActivation.LOW) {
        if (prevActivation.LOW) stopReedL1(frequency);
        if (reedActivation.LOW) playReedL1(frequency);
      }
      if (prevActivation.MID_1 !== reedActivation.MID_1) {
        if (prevActivation.MID_1) stopReedM1(frequency);
        if (reedActivation.MID_1) playReedM1(frequency);
      }
      if (prevActivation.MID_2 !== reedActivation.MID_2) {
        if (prevActivation.MID_2) stopReedM2(frequency);
        if (reedActivation.MID_2) playReedM2(frequency);
      }
      if (prevActivation.MID_3 !== reedActivation.MID_3) {
        if (prevActivation.MID_3) stopReedM3(frequency);
        if (reedActivation.MID_3) playReedM3(frequency);
      }
      if (prevActivation.HIGH !== reedActivation.HIGH) {
        if (prevActivation.HIGH) stopReedH1(frequency);
        if (reedActivation.HIGH) playReedH1(frequency);
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
    if (reedActivation.LOW) playReedL1(frequency);
    if (reedActivation.MID_1) playReedM1(frequency);
    if (reedActivation.MID_2) playReedM2(frequency);
    if (reedActivation.MID_3) playReedM3(frequency);
    if (reedActivation.HIGH) playReedH1(frequency);
  };

  const stopActiveReeds = (frequency: number) => {
    activeFrequenciesRef.current.delete(frequency);
    if (reedActivation.LOW) stopReedL1(frequency);
    if (reedActivation.MID_1) stopReedM1(frequency);
    if (reedActivation.MID_2) stopReedM2(frequency);
    if (reedActivation.MID_3) stopReedM3(frequency);
    if (reedActivation.HIGH) stopReedH1(frequency);
  };

  return { playActiveReeds, stopActiveReeds };
};
