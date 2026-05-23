import { buildFrame, parseFrame } from "../../../pipeline/frame";
import { goertzelPower } from "./goertzel";
import {
  appendTone,
  bytesToBinaryFskSamples,
  bytesToMfsk4Samples,
} from "./symbolModem";

describe("WebAudio symbol modem", () => {
  it("MFSK-4 waveform length scales with frame size", () => {
    const frame = buildFrame({
      version: 3,
      messageId: "m1",
      modemId: "MFSK_AUDIBLE_4",
      payloadType: "text",
      bytes: new TextEncoder().encode("hello"),
    });
    const samples = bytesToMfsk4Samples(
      frame,
      [1800, 2200, 2600, 3000],
      80,
      15,
      0.08,
    );
    expect(samples.length).toBeGreaterThan(48_000);
  });

  it("FSK waveform encodes mark tone energy", () => {
    const samples = bytesToBinaryFskSamples(
      new Uint8Array([0xff]),
      1200,
      2200,
      30,
      0.09,
    );
    const slice = samples.slice(0, 512);
    const mark = goertzelPower(slice, 48_000, 1200);
    const space = goertzelPower(slice, 48_000, 2200);
    expect(mark).toBeGreaterThan(space);
  });

  it("ATLV frame round-trip independent of modem waveform", () => {
    const frame = buildFrame({
      version: 3,
      messageId: "x",
      modemId: "FSK_TUNABLE_FAST",
      payloadType: "text",
      bytes: new Uint8Array([1, 2, 3]),
    });
    const parsed = parseFrame(frame);
    expect(parsed.modemId).toBe("FSK_TUNABLE_FAST");
    expect(Array.from(parsed.bytes)).toEqual([1, 2, 3]);
  });

  it("appendTone advances phase continuously", () => {
    const out: number[] = [];
    const phase = { value: 0 };
    appendTone(out, 48_000, 1000, 10, 0.5, phase);
    appendTone(out, 48_000, 1000, 10, 0.5, phase);
    expect(out.length).toBeGreaterThan(0);
    expect(phase.value).not.toBe(0);
  });
});
