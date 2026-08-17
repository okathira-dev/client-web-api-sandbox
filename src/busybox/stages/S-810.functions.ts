export type S810AspectKey =
  | "square"
  | "four-three"
  | "sixteen-nine"
  | "nine-twenty";

export const S810_ASPECT_TOLERANCE = 0.05;

export const s810AspectTargets = {
  square: 1,
  "four-three": 4 / 3,
  "sixteen-nine": 16 / 9,
  "nine-twenty": 9 / 20,
} as const satisfies Record<S810AspectKey, number>;

export function aspectRatio(width: number, height: number) {
  return width > 0 && height > 0 ? width / height : undefined;
}

export function isAspectRatioWithinTolerance(
  actual: number,
  target: number,
  tolerance = S810_ASPECT_TOLERANCE,
) {
  const relativeError = Math.abs(actual - target) / target;
  return (
    Number.isFinite(actual) &&
    Number.isFinite(target) &&
    target > 0 &&
    tolerance >= 0 &&
    relativeError <= tolerance + Number.EPSILON
  );
}

export function classifyS810AspectRatio(
  width: number,
  height: number,
  tolerance = S810_ASPECT_TOLERANCE,
): S810AspectKey | undefined {
  const actual = aspectRatio(width, height);
  if (actual === undefined) return undefined;

  for (const [key, target] of Object.entries(s810AspectTargets) as [
    S810AspectKey,
    number,
  ][]) {
    if (isAspectRatioWithinTolerance(actual, target, tolerance)) return key;
  }
  return undefined;
}
