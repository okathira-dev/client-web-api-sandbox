/**
 * XSDベースの仕様書読み込みのテスト
 */

import { loadTegSpecificationFromXsd } from "./loadSpecs";

describe("loadSpecs", () => {
  describe("loadTegSpecificationFromXsd", () => {
    it("XSDから仕様書を読み込めること", async () => {
      const specification = await loadTegSpecificationFromXsd("TEG800");
      expect(specification).toBeDefined();
      expect(specification.tegCode).toBe("TEG800");
    });

    it("既存のloadTegSpecificationと同じ形式のTegSpecificationを返すこと（後方互換性）", async () => {
      const specification = await loadTegSpecificationFromXsd("TEG800");

      // TegSpecificationインターフェースに準拠していることを確認
      expect(specification).toHaveProperty("tegCode");
      expect(specification).toHaveProperty("xmlStructureMetadata");
      expect(specification).toHaveProperty("xmlStructureItems");
      expect(specification).toHaveProperty("formFieldMetadata");
      expect(specification).toHaveProperty("formFieldItems");

      // メタデータの確認
      expect(specification.xmlStructureMetadata.tegCode).toBe("TEG800");
      expect(specification.xmlStructureMetadata.formName).toBeDefined();
      expect(specification.formFieldMetadata.tegCode).toBe("TEG800");
      expect(specification.formFieldMetadata.formName).toBeDefined();

      // 項目が存在することを確認
      expect(specification.xmlStructureItems.length).toBeGreaterThan(0);
      expect(specification.formFieldItems.length).toBeGreaterThan(0);
    });

    it("メタデータ（帳票名称、バージョン）をXSDのdocumentationから取得できること", async () => {
      const specification = await loadTegSpecificationFromXsd("TEG800");

      // 帳票名称が設定されていることを確認
      expect(specification.xmlStructureMetadata.formName).toContain(
        "生命保険料控除証明書",
      );
      expect(specification.formFieldMetadata.formName).toContain(
        "生命保険料控除証明書",
      );

      // バージョンが設定されていることを確認
      expect(specification.xmlStructureMetadata.version).toBeDefined();
      expect(specification.formFieldMetadata.version).toBeDefined();
    });
  });
});
