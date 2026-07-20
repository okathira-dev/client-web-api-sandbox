import { createLaunchUrl, parseLaunchEnvelope } from "./launchEnvelope";

describe("Busybox launch envelopes", () => {
  it("round-trips an issued launch URL", () => {
    const url = createLaunchUrl(
      "https://example.test/busybox/index.html",
      "S-440",
      "file",
      "round-1",
    );
    expect(parseLaunchEnvelope(url)).toMatchObject({
      source: "file",
      roundId: "round-1",
    });
    expect(url.searchParams.get("stage")).toBe("S-440");
  });

  it("rejects direct and stale launch URLs", () => {
    expect(
      parseLaunchEnvelope(
        new URL("https://example.test/busybox/index.html?stage=S-440"),
      ),
    ).toBeNull();
    const stale = createLaunchUrl(
      "https://example.test/busybox/index.html",
      "S-440",
      "file",
      "round-1",
    );
    stale.searchParams.set("issuedAt", "1");
    expect(parseLaunchEnvelope(stale)).toBeNull();
  });
});
