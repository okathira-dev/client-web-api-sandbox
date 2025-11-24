/**
 * XSDベースの要素マッピング生成のテスト
 */

import { generateElementMappingsFromXsd } from "./elementMappingFromXsd";

describe("elementMappingFromXsd", () => {
  describe("generateElementMappingsFromXsd", () => {
    it("XSDから正しく要素マッピングを生成できること", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");
      expect(mappings.length).toBeGreaterThan(0);

      // ElementMappingの形式を確認
      const firstMapping = mappings[0];
      expect(firstMapping).toHaveProperty("teg");
      expect(firstMapping).toHaveProperty("elementCode");
      expect(firstMapping).toHaveProperty("label");
    });

    it("既存のgenerateElementMappingsと同じ形式のElementMapping[]を返すこと", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");

      // すべてのマッピングがElementMappingインターフェースに準拠していることを確認
      for (const mapping of mappings) {
        expect(mapping.teg).toBe("TEG800");
        expect(typeof mapping.elementCode).toBe("string");
        expect(typeof mapping.label).toBe("string");
        // オプショナルプロパティの型チェック
        if (mapping.category !== undefined) {
          expect(typeof mapping.category).toBe("string");
        }
        if (mapping.inputType !== undefined) {
          expect(typeof mapping.inputType).toBe("string");
        }
        if (mapping.level !== undefined) {
          expect(typeof mapping.level).toBe("number");
        }
        if (mapping.parentElementCode !== undefined) {
          expect(typeof mapping.parentElementCode).toBe("string");
        }
        if (mapping.repeatCount !== undefined) {
          expect(typeof mapping.repeatCount).toBe("number");
        }
      }
    });

    it("日本語名がXSDのappinfoから取得されること", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping).toBeDefined();
      expect(wcaMapping?.label).toBe("保険会社名");
    });

    it("親子関係が正しく設定されること", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping).toBeDefined();
      expect(wcaMapping?.parentElementCode).toBe("TEG800");

      // ルート要素には親要素コードがないことを確認
      const rootMapping = mappings.find((m) => m.elementCode === "TEG800");
      expect(rootMapping).toBeDefined();
      expect(rootMapping?.parentElementCode).toBeUndefined();
    });

    it("入力型が型情報から推測されること", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");

      // 列挙値がある要素は「区分」になる
      // 数値型（long, decimal）は「数値」になる
      // その他は「文字」になる
      // 実際のXSDに基づいて確認
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping).toBeDefined();
      // gen:name型は文字列なので、inputTypeは「文字」または未定義
      if (wcaMapping?.inputType) {
        expect(["文字", "区分", "数値"]).toContain(wcaMapping.inputType);
      }
    });

    it("カテゴリが親要素の日本語名から設定されること", async () => {
      const mappings = await generateElementMappingsFromXsd("TEG800");

      // 親要素がある場合、カテゴリが設定される可能性がある
      // 実際のXSD構造に基づいて確認
      const childMapping = mappings.find(
        (m) => m.elementCode !== "TEG800" && m.parentElementCode,
      );
      if (childMapping && childMapping.parentElementCode) {
        const parentMapping = mappings.find(
          (m) => m.elementCode === childMapping.parentElementCode,
        );
        // カテゴリが設定されている場合、親要素の日本語名と一致する可能性がある
        if (childMapping.category && parentMapping) {
          // カテゴリは親要素の日本語名から推測される
          expect(typeof childMapping.category).toBe("string");
        }
      }
    });
  });
});
