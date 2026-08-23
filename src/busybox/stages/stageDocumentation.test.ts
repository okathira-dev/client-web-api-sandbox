import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const stageDirectory = join(process.cwd(), "src", "busybox", "stages");
const stageFiles = readdirSync(stageDirectory)
  .filter((name) => /^S-\d{3}\.tsx$/.test(name))
  .sort();

describe("stage documentation coverage", () => {
  it("keeps every shipped stage beside a locale bundle and MECE Japanese solution JSDoc", () => {
    expect(stageFiles).toHaveLength(89);
    for (const file of stageFiles) {
      const id = file.slice(0, -4);
      const source = readFileSync(join(stageDirectory, file), "utf8");
      const localeSource = readFileSync(
        join(stageDirectory, `${id}.locale.ts`),
        "utf8",
      );
      expect(localeSource).toMatch(/ja:/);
      expect(localeSource).toMatch(/en:/);
      expect(source).not.toContain(
        "の箱が示すブラウザ固有の状態・イベント・データ受け渡し",
      );
      expect(localeSource).not.toContain(
        "このステージのブラウザ挙動を観察する",
      );
      expect(localeSource).not.toContain(
        "Observe the browser behavior in this stage",
      );
      expect(localeSource).not.toMatch(/^\s+hint:/m);
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
      expect(source).not.toContain("Gimmick:");
      const documentation = [...source.matchAll(/\/\*\*[\s\S]*?\*\//g)].map(
        (match) => match[0],
      );
      expect(documentation).toHaveLength(1);
      const stageJSDoc = documentation[0] ?? "";
      expect(stageJSDoc).toMatch(/[ぁ-んァ-ヶ一-龯]/);
      expect(stageJSDoc).toContain("目的:");
      expect(stageJSDoc).toContain("最初の一手:");
      expect(stageJSDoc).toMatch(/箱ごとの(?:解法|成功条件):/);
      expect(stageJSDoc).toContain("開かない操作:");
      expect(stageJSDoc).toMatch(/(?:使用API:|API\/権限:)/);
      expect(stageJSDoc).toMatch(/(?:権限・privacy:|API\/権限:)/);
      expect(stageJSDoc).toMatch(/(?:cleanup:|cleanup\/環境:)/);
      expect(stageJSDoc).toMatch(/(?:対応環境:|cleanup\/環境:)/);
      expect(stageJSDoc).toMatch(/(?:人手確認:|H-\d{3})/);
    }
  });
});
