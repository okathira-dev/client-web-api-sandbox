import { runMathRandomCli } from "./mathRandomCli";

describe("math-random CLI", () => {
  it("seed 指定で Node current モデルの系列を生成できること", async () => {
    const stdout: string[] = [];

    const exitCode = await runMathRandomCli(
      ["generate", "--seed", "1337", "--count", "3"],
      { write: (line) => stdout.push(line) },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      "model: v8-node-24-cache-lifo-state0",
      "0.9311600617849974",
      "0.3551442693830502",
      "0.7923158995678378",
    ]);
  });

  it("観測値から solver を実行し、次の値を表示できること", async () => {
    const stdout: string[] = [];

    const exitCode = await runMathRandomCli(
      [
        "observe",
        "--values",
        "0.9311600617849974 0.3551442693830502 0.7923158995678378 0.7877779424089971",
        "--cache-offset",
        "0",
      ],
      { write: (line) => stdout.push(line) },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toContain("cacheOffset: 0");
    expect(stdout).toContain("theoryRemainingBits: 0");
    expect(stdout).toContain("status: unique");
    expect(stdout).toContain("candidateCount: 1");
    expect(stdout).toContain("matchedCacheOffset: 0");
    expect(stdout).toContain("next: 0.37637226430349113");
  });

  it("cache offset 未指定では境界候補ごとの次値候補を表示できること", async () => {
    const stdout: string[] = [];

    const exitCode = await runMathRandomCli(
      [
        "observe",
        "--values",
        "0.9311600617849974 0.3551442693830502 0.7923158995678378 0.7877779424089971",
      ],
      { write: (line) => stdout.push(line) },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toContain("cacheOffset: unknown");
    expect(stdout.some((line) => line.startsWith("next"))).toBe(true);
  });
});
