import { describe, expect, test } from "@jest/globals";

import {
  createImageSampleFile,
  IMAGE_SAMPLE_DEFINITIONS,
  TEXT_SAMPLES,
} from "./sampleData";

describe("sampleData", () => {
  test("text samples have expected byte sizes", () => {
    const encoder = new TextEncoder();
    for (const sample of TEXT_SAMPLES) {
      if (sample.id === "short-64") {
        expect(encoder.encode(sample.content).length).toBeGreaterThanOrEqual(
          60,
        );
        expect(encoder.encode(sample.content).length).toBeLessThanOrEqual(128);
        continue;
      }
      expect(encoder.encode(sample.content).length).toBe(sample.bytes);
    }
  });

  test("image sample factory returns bmp files", () => {
    for (const sample of IMAGE_SAMPLE_DEFINITIONS) {
      const file = createImageSampleFile(sample.id);
      expect(file.type).toBe("image/bmp");
      expect(file.size).toBeGreaterThan(1024);
    }
  });
});
