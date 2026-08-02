import { withDeadline } from "./async";

describe("withDeadline", () => {
  it("resolves normally and removes its timer", async () => {
    await expect(
      withDeadline(
        Promise.resolve("done"),
        1_000,
        new AbortController().signal,
        "test",
      ),
    ).resolves.toBe("done");
  });

  it("rejects when the caller cancels", async () => {
    const controller = new AbortController();
    const pending = withDeadline(
      new Promise<never>(() => {}),
      1_000,
      controller.signal,
      "test",
    );
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("rejects when the deadline expires", async () => {
    await expect(
      withDeadline(
        new Promise<never>(() => {}),
        0,
        new AbortController().signal,
        "test",
      ),
    ).rejects.toThrow("test-timeout");
  });
});
