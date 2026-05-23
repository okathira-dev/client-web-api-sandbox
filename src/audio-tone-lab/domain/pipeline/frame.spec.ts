import { buildFrame, parseFrame } from "./frame";

describe("ATLV frame v3", () => {
  it("round-trips text payload", () => {
    const bytes = new TextEncoder().encode("hello modem");
    const frame = buildFrame({
      version: 3,
      messageId: "test-msg",
      modemId: "QUIET_AUDIBLE",
      payloadType: "text",
      bytes,
    });
    const parsed = parseFrame(frame);
    expect(parsed.messageId).toBe("test-msg");
    expect(parsed.modemId).toBe("QUIET_AUDIBLE");
    expect(parsed.payloadType).toBe("text");
    expect(new TextDecoder().decode(parsed.bytes)).toBe("hello modem");
  });

  it("round-trips file metadata", () => {
    const frame = buildFrame({
      version: 3,
      messageId: "file-1",
      modemId: "GGWAVE_AUDIBLE",
      payloadType: "file",
      fileName: "photo.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3]),
    });
    const parsed = parseFrame(frame);
    expect(parsed.fileName).toBe("photo.png");
    expect(parsed.mimeType).toBe("image/png");
    expect(Array.from(parsed.bytes)).toEqual([1, 2, 3]);
  });

  it("rejects CRC mismatch", () => {
    const frame = buildFrame({
      version: 3,
      messageId: "x",
      modemId: "MFSK_AUDIBLE_4",
      payloadType: "text",
      bytes: new Uint8Array([0]),
    });
    frame[frame.length - 1] = (frame[frame.length - 1] ?? 0) ^ 0xff;
    expect(() => parseFrame(frame)).toThrow("CRC mismatch");
  });
});
