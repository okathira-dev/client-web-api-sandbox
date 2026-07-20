import {
  createRoundEnvelope,
  isRoundEnvelope,
  roundChannelName,
  roundLifetimeMs,
} from "./roundProtocol";

describe("Busybox round protocol", () => {
  it("accepts only matching, current envelopes", () => {
    const envelope = createRoundEnvelope("S-190", "round-1", "ready", {
      marker: true,
    });
    expect(isRoundEnvelope(envelope, "S-190", "round-1")).toBe(true);
    expect(isRoundEnvelope(envelope, "S-250", "round-1")).toBe(false);
    expect(
      isRoundEnvelope({
        ...envelope,
        sentAt: Date.now() - roundLifetimeMs - 1,
      }),
    ).toBe(false);
  });

  it("uses stage and round identities in channel names", () => {
    expect(roundChannelName("S-190", "round-1")).toBe("busybox:S-190:round-1");
  });
});
