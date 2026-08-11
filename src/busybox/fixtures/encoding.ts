import type { EncodingFixture } from "./encoding/data";

/** Product-facing boundary for the verified encoding puzzle fixture. */
export {
  type EncodingFixture,
  encodingFixtures,
} from "./encoding/data";

export const encodingQuestionText = (fixture: EncodingFixture) => {
  return fixture.presentedText;
};

export const encodingProblemIds = [
  "S-640-B01",
  "S-640-B02",
  "S-640-B03",
  "S-640-B04",
  "S-640-B05",
  "S-640-B06",
  "S-640-B07",
  "S-640-B08",
] as const;

export const encodingProblemIdAt = (index: number) => {
  const problemId = encodingProblemIds[index];
  if (!problemId) {
    throw new RangeError(`No S-640 problem for fixture index ${index}`);
  }
  return problemId;
};
