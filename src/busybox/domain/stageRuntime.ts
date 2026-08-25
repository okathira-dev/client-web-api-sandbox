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
  solvedBoxIds: ReadonlySet<string>,
): number {
  return boxIds.filter((boxId) => solvedBoxIds.has(boxId)).length;
}

export function deriveStageProgress(
  boxIds: readonly string[],
  solvedBoxIds: ReadonlySet<string>,
): StageProgressState {
  const solved = countSolvedBoxes(boxIds, solvedBoxIds);
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
