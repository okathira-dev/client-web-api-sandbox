/**
 * 次回起動時も保つ実行設定。
 *
 * 入力欄は途中の文字列も受け付ける必要があるので、生の文字列を保持し、
 * 検証済みの数値は派生値として持つ。数値が null のときは実行させない。
 */

import { atom, useAtomValue, useSetAtom } from "jotai";

import type { InputMode } from "../domain/types";
import {
  loadPreferences,
  parseCandidatePauseMs,
  parseSustainedDurationSeconds,
  savePreferences,
} from "../utils/preferences";

const initial = loadPreferences();

const candidatePauseInputAtom = atom(String(initial.candidatePauseMs));
const sustainedDurationInputAtom = atom(
  String(initial.sustainedDurationSeconds),
);
const sustainedInputModeAtom = atom<InputMode>(initial.sustainedInputMode);

const candidatePauseMsAtom = atom((get) =>
  parseCandidatePauseMs(get(candidatePauseInputAtom)),
);
const sustainedDurationSecondsAtom = atom((get) =>
  parseSustainedDurationSeconds(get(sustainedDurationInputAtom)),
);

/** 有効な値になったときだけ localStorage へ書く。入力途中の文字列は保存しない。 */
const persistAtom = atom(null, (get) => {
  const candidatePauseMs = get(candidatePauseMsAtom);
  const sustainedDurationSeconds = get(sustainedDurationSecondsAtom);
  savePreferences({
    candidatePauseMs: candidatePauseMs ?? initial.candidatePauseMs,
    sustainedDurationSeconds:
      sustainedDurationSeconds ?? initial.sustainedDurationSeconds,
    sustainedInputMode: get(sustainedInputModeAtom),
  });
});

const setCandidatePauseInputAtom = atom(null, (_get, set, value: string) => {
  set(candidatePauseInputAtom, value);
  set(persistAtom);
});

const setSustainedDurationInputAtom = atom(null, (_get, set, value: string) => {
  set(sustainedDurationInputAtom, value);
  set(persistAtom);
});

const setSustainedInputModeAtom = atom(null, (_get, set, value: InputMode) => {
  set(sustainedInputModeAtom, value);
  set(persistAtom);
});

export const useCandidatePauseInput = () =>
  useAtomValue(candidatePauseInputAtom);
export const useSetCandidatePauseInput = () =>
  useSetAtom(setCandidatePauseInputAtom);
export const useCandidatePauseMs = () => useAtomValue(candidatePauseMsAtom);

export const useSustainedDurationInput = () =>
  useAtomValue(sustainedDurationInputAtom);
export const useSetSustainedDurationInput = () =>
  useSetAtom(setSustainedDurationInputAtom);
export const useSustainedDurationSeconds = () =>
  useAtomValue(sustainedDurationSecondsAtom);

export const useSustainedInputMode = () => useAtomValue(sustainedInputModeAtom);
export const useSetSustainedInputMode = () =>
  useSetAtom(setSustainedInputModeAtom);
