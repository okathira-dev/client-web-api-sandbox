import type { ModemId, ModemTuning, TuningPresetId } from "./types";

const STORAGE_PREFIX = "audio-tone-lab-modem-tuning:";

export function loadModemTuning(
  modemId: ModemId,
  fallback: ModemTuning,
): ModemTuning {
  if (typeof localStorage === "undefined") return { ...fallback };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${modemId}`);
    if (!raw) return { ...fallback };
    return { ...fallback, ...(JSON.parse(raw) as ModemTuning) };
  } catch {
    return { ...fallback };
  }
}

export function saveModemTuning(modemId: ModemId, tuning: ModemTuning) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${modemId}`, JSON.stringify(tuning));
}

export function resolvePresetTuning(
  entry: {
    presets: Partial<Record<TuningPresetId, ModemTuning>>;
  },
  preset: TuningPresetId,
  base: ModemTuning,
): ModemTuning {
  if (preset === "custom") return { ...base };
  const patch = entry.presets[preset] ?? entry.presets.default ?? {};
  return { ...base, ...patch };
}
