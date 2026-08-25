import { readFileSync } from "node:fs";

const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3]);

const recoveryUrl = new URL(
  "../../fixtures/s710/assets/decode-failure-output.webm",
  import.meta.url,
);

describe("S-710 decode-failure recovery fixture", () => {
  it("ships the decode-failure result as a fixed product fixture", () => {
    const bytes = readFileSync(recoveryUrl);
    expect(bytes.length).toBeGreaterThan(256);
    expect(bytes.subarray(0, webmHeader.length)).toEqual(webmHeader);
  });
});
