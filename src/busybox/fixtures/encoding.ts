import type { EncodingFixture } from "./encoding/data";

/** Product-facing boundary for the verified encoding puzzle fixture. */
export {
  type EncodingFixture,
  encodingFixtures,
} from "./encoding/data";

export const encodingQuestionText = (fixture: EncodingFixture) => {
  return fixture.presentedText;
};
