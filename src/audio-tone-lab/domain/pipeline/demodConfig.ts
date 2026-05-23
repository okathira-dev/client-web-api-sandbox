export type DemodSensitivityMode = "auto" | "manual";

export interface DemodSensitivityConfig {
  mode: DemodSensitivityMode;
  detectionRatio: number;
  minPowerFloor: number;
  inputGain: number;
  autoMargin: number;
}

export const DEMOD_CONFIG_STORAGE_KEY = "audio-tone-lab-demod-config";

export const DEFAULT_DEMOD_CONFIG: DemodSensitivityConfig = {
  mode: "auto",
  detectionRatio: 0.12,
  minPowerFloor: 1e-6,
  inputGain: 2,
  autoMargin: 3,
};

export function loadDemodConfig(): DemodSensitivityConfig {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_DEMOD_CONFIG };
  }
  try {
    const raw = localStorage.getItem(DEMOD_CONFIG_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DEMOD_CONFIG };
    return clampDemodConfig({
      ...DEFAULT_DEMOD_CONFIG,
      ...(JSON.parse(raw) as Partial<DemodSensitivityConfig>),
    });
  } catch {
    return { ...DEFAULT_DEMOD_CONFIG };
  }
}

export function saveDemodConfig(config: DemodSensitivityConfig) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    DEMOD_CONFIG_STORAGE_KEY,
    JSON.stringify(clampDemodConfig(config)),
  );
}

export function demodConfigFromTuning(
  tuning: Record<string, number | string | boolean>,
): DemodSensitivityConfig {
  const mode = tuning.detectionMode === "manual" ? "manual" : ("auto" as const);
  return clampDemodConfig({
    mode,
    detectionRatio: 0.12,
    minPowerFloor: 1e-6,
    inputGain: Number(tuning.inputGain ?? 2),
    autoMargin: 3,
  });
}

export function clampDemodConfig(
  config: DemodSensitivityConfig,
): DemodSensitivityConfig {
  return {
    ...config,
    detectionRatio: Math.min(0.25, Math.max(0.04, config.detectionRatio)),
    minPowerFloor: Math.min(1e-4, Math.max(1e-8, config.minPowerFloor)),
    inputGain: Math.min(4, Math.max(1, config.inputGain)),
    autoMargin: Math.min(6, Math.max(2, config.autoMargin)),
  };
}

export interface DetectionThresholdState {
  noiseFloor: number;
  threshold: number;
  ratioUsed: number;
}

export function computeDetectionThreshold(
  bestLowPower: number,
  bestHighPower: number,
  config: DemodSensitivityConfig,
  noiseFloorEstimate: number | null,
): DetectionThresholdState {
  const peakSum = bestLowPower + bestHighPower;

  if (config.mode === "auto" && noiseFloorEstimate !== null) {
    const threshold = Math.max(
      config.minPowerFloor,
      noiseFloorEstimate * config.autoMargin,
    );
    return {
      noiseFloor: noiseFloorEstimate,
      threshold,
      ratioUsed: config.autoMargin,
    };
  }

  const threshold = Math.max(
    config.minPowerFloor,
    peakSum * config.detectionRatio,
  );
  return {
    noiseFloor: noiseFloorEstimate ?? 0,
    threshold,
    ratioUsed: config.detectionRatio,
  };
}
