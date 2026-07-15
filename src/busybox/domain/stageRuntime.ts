import type { BoxProgress } from "./progress";

export type CapabilityState =
  | "available"
  | "permission-required"
  | "unsupported"
  | "unavailable"
  | "unknown";

export type StageProgressState = "untouched" | "partial" | "solved";

export function deriveStageProgress(
  boxIds: readonly string[],
  solvedBoxes: Readonly<Record<string, BoxProgress>>,
): StageProgressState {
  const solved = boxIds.filter(
    (boxId) => solvedBoxes[boxId] !== undefined,
  ).length;
  if (solved === 0) return "untouched";
  if (solved === boxIds.length) return "solved";
  return "partial";
}

export function safeCapabilityProbe(
  probe: () => CapabilityState,
): CapabilityState {
  try {
    return probe();
  } catch {
    // Capability checks run while rendering the catalogue and must never take the
    // whole game down when a browser exposes a partial or throwing implementation.
    return "unknown";
  }
}
