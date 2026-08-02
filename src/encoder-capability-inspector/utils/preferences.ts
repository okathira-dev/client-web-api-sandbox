/** 次回起動時にも保つ UI 設定。レポート本体とは別に localStorage へ置く。 */

import {
  DEFAULT_CANDIDATE_PAUSE_MS,
  DEFAULT_SUSTAINED_DURATION_SECONDS,
  MAX_CANDIDATE_PAUSE_MS,
  MAX_SUSTAINED_DURATION_SECONDS,
  MIN_SUSTAINED_DURATION_SECONDS,
  PREFERENCES_STORAGE_KEY,
} from "../consts/inspection";
import type { InputMode } from "../domain/types";

export type Preferences = {
  readonly candidatePauseMs: number;
  readonly sustainedDurationSeconds: number;
  readonly sustainedInputMode: InputMode;
};

export const DEFAULT_PREFERENCES: Preferences = {
  candidatePauseMs: DEFAULT_CANDIDATE_PAUSE_MS,
  sustainedDurationSeconds: DEFAULT_SUSTAINED_DURATION_SECONDS,
  sustainedInputMode: "synthetic",
};

/**
 * 数値化する前に、数値でも「中身のある文字列」でもない入力を弾く。
 * `Number(null)` と `Number("")` はどちらも 0 になるため、これを通すと
 * 空欄の入力欄が「0 が指定された」と誤って解釈される。
 */
const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return null;
};

/**
 * 候補間待機は 0〜2000 の整数だけを受け付ける。
 * 範囲外や非整数は「不正」として null を返し、呼び出し側で実行を止める。
 */
export const parseCandidatePauseMs = (value: unknown): number | null => {
  const parsed = toNumber(value);
  return parsed !== null &&
    Number.isInteger(parsed) &&
    parsed >= 0 &&
    parsed <= MAX_CANDIDATE_PAUSE_MS
    ? parsed
    : null;
};

export const parseSustainedDurationSeconds = (
  value: unknown,
): number | null => {
  const parsed = toNumber(value);
  return parsed !== null &&
    Number.isFinite(parsed) &&
    parsed >= MIN_SUSTAINED_DURATION_SECONDS &&
    parsed <= MAX_SUSTAINED_DURATION_SECONDS
    ? parsed
    : null;
};

const parseInputMode = (value: unknown): InputMode =>
  value === "live" ? "live" : "synthetic";

export const loadPreferences = (): Preferences => {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) {
      return DEFAULT_PREFERENCES;
    }
    const record = parsed as Record<string, unknown>;
    return {
      candidatePauseMs:
        parseCandidatePauseMs(record.candidatePauseMs) ??
        DEFAULT_PREFERENCES.candidatePauseMs,
      sustainedDurationSeconds:
        parseSustainedDurationSeconds(record.sustainedDurationSeconds) ??
        DEFAULT_PREFERENCES.sustainedDurationSeconds,
      sustainedInputMode: parseInputMode(record.sustainedInputMode),
    };
  } catch {
    // 壊れた値や localStorage 不可の環境では既定値で続行する。
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferences = (preferences: Preferences): void => {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // 保存できなくても検査自体は続行できるため握りつぶす。
  }
};
