import type { BoxProgress } from "./progress";

export type CapabilityState =
  | "available"
  | "permission-required"
  | "unsupported"
  | "unavailable"
  | "unknown";

export type StageProgressState = "untouched" | "partial" | "solved";
export type ProblemBoxVisualState = "ribboned" | "closed" | "open";

export function deriveProblemBoxVisualState(
  solvedBeforeEntry: boolean,
  solvedThisAttempt: boolean,
): ProblemBoxVisualState {
  if (solvedThisAttempt) return "open";
  return solvedBeforeEntry ? "closed" : "ribboned";
}

export function countSolvedBoxes(
  boxIds: readonly string[],
  solvedBoxes: Readonly<Record<string, BoxProgress>>,
): number {
  return boxIds.filter((boxId) => solvedBoxes[boxId] !== undefined).length;
}

export function deriveStageProgress(
  boxIds: readonly string[],
  solvedBoxes: Readonly<Record<string, BoxProgress>>,
): StageProgressState {
  const solved = countSolvedBoxes(boxIds, solvedBoxes);
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
