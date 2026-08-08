import { readAacAudioObjectType } from "./aac";

describe("readAacAudioObjectType", () => {
  it("reads a regular five-bit Audio Object Type", () => {
    // 2 (AAC-LC) followed by a 48 kHz sampling-frequency index.
    expect(readAacAudioObjectType(new Uint8Array([0x11, 0x90]))).toBe(2);
  });

  it("reads the extended representation used by xHE-AAC", () => {
    // 31, then 10: 32 + 10 = 42 (xHE-AAC).
    expect(readAacAudioObjectType(new Uint8Array([0xf9, 0x40]))).toBe(42);
  });

  it("returns null when the description cannot contain an object type", () => {
    expect(readAacAudioObjectType(undefined)).toBeNull();
    expect(readAacAudioObjectType(new Uint8Array())).toBeNull();
  });
});
