import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const stageDirectory = join(process.cwd(), "src", "busybox", "stages");
const stageFiles = readdirSync(stageDirectory)
  .filter((name) => /^S-\d{3}\.tsx$/.test(name))
  .sort();

const requiredHeadings = [
  "目的:",
  "最初の一手:",
  "箱ごとの解法:",
  "開かない操作:",
  "使用API:",
  "権限・privacy:",
  "cleanup:",
  "対応環境:",
  "人手確認:",
] as const;

describe("stage documentation coverage", () => {
  it("keeps every shipped stage beside a locale bundle and MECE Japanese solution JSDoc", () => {
    expect(stageFiles).toHaveLength(67);
    for (const file of stageFiles) {
      const id = file.slice(0, -4);
      const source = readFileSync(join(stageDirectory, file), "utf8");
      const localeSource = readFileSync(
        join(stageDirectory, `${id}.locale.ts`),
        "utf8",
      );
      expect(localeSource).toMatch(/ja:/);
      expect(localeSource).toMatch(/en:/);
      const jaKeys = [
        ...localeSource.matchAll(/^\s+(\w+):\s*\{[\s\S]*?\bja:/gm),
      ]
        .map((match) => match[1])
        .sort();
      const enKeys = [
        ...localeSource.matchAll(/^\s+(\w+):\s*\{[\s\S]*?\ben:/gm),
      ]
        .map((match) => match[1])
        .sort();
      expect(jaKeys).toEqual(enKeys);
      const exportIndex = source.search(/export (?:default function|\{)/);
      expect(exportIndex).toBeGreaterThanOrEqual(0);
      const documentation = source.slice(
        Math.max(0, exportIndex - 1600),
        exportIndex,
      );
      for (const heading of requiredHeadings)
        expect(documentation).toContain(heading);
    }
  });
});
