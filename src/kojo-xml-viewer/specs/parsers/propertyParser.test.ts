/**
 * PropertyParserのテスト
 */

import { loadKubunMappingsFromProperty } from "./propertyParser";

describe("propertyParser", () => {
  describe("loadKubunMappingsFromProperty", () => {
    it("TEG800のkubun_CDマッピングを正しく読み込む", async () => {
      const mappings = await loadKubunMappingsFromProperty("TEG800");

      // WCE00030のkubun_CDのマッピングを確認
      expect(mappings.get("TEG800_WCE00030_1")).toBe("新生命保険料控除制度");
      expect(mappings.get("TEG800_WCE00030_2")).toBe("旧生命保険料控除制度");
      expect(mappings.get("TEG800_WCE00030_3")).toBe(
        "新生命保険料控除制度及び旧生命保険料控除制度",
      );
    });

    it("TEG840のkubun_CDマッピングを正しく読み込む", async () => {
      const mappings = await loadKubunMappingsFromProperty("TEG840");

      // WOA00000のkubun_CDのマッピングを確認
      expect(mappings.get("TEG840_WOA00000_1")).toBe("国民年金保険料");
      expect(mappings.get("TEG840_WOA00000_2")).toBe("国民年金基金掛金");

      // WOB00000のkubun_CDのマッピングを確認
      expect(mappings.get("TEG840_WOB00000_1")).toBe("無");
      expect(mappings.get("TEG840_WOB00000_2")).toBe("有");

      // WOJ00000のkubun_CDのマッピングを確認
      expect(mappings.get("TEG840_WOJ00000_1")).toBe("国民年金保険料");
      expect(mappings.get("TEG840_WOJ00000_2")).toBe("国民年金基金掛金");

      // WOO00060のkubun_CDのマッピングを確認
      expect(mappings.get("TEG840_WOO00060_1")).toBe("済");
      expect(mappings.get("TEG840_WOO00060_2")).toBe("見");

      // WOO00030のkubun_CDのマッピングを確認
      expect(mappings.get("TEG840_WOO00030_1")).toBe("済");
      expect(mappings.get("TEG840_WOO00030_2")).toBe("見");
    });

    it("TEG810のkubun_CDマッピングを正しく読み込む", async () => {
      const mappings = await loadKubunMappingsFromProperty("TEG810");

      // WDE00020のkubun_CDのマッピングを確認
      expect(mappings.get("TEG810_WDE00020_1")).toBe("地震保険料");
      expect(mappings.get("TEG810_WDE00020_2")).toBe("旧長期損害保険料");
      expect(mappings.get("TEG810_WDE00020_3")).toBe(
        "地震保険料及び旧長期損害保険料",
      );

      // WDE00070のkubun_CDのマッピングを確認
      expect(mappings.get("TEG810_WDE00070_1")).toBe("建物");
      expect(mappings.get("TEG810_WDE00070_2")).toBe("家財");
      expect(mappings.get("TEG810_WDE00070_3")).toBe("建物及び家財");
      expect(mappings.get("TEG810_WDE00070_4")).toBe("その他");

      // WDE00110のkubun_CDのマッピングを確認
      expect(mappings.get("TEG810_WDE00110_1")).toBe("有");
      expect(mappings.get("TEG810_WDE00110_2")).toBe("無");

      // WDE00150のkubun_CDのマッピングを確認
      expect(mappings.get("TEG810_WDE00150_1")).toBe("年払");
      expect(mappings.get("TEG810_WDE00150_2")).toBe("一時払");
      expect(mappings.get("TEG810_WDE00150_3")).toBe("月払");
      expect(mappings.get("TEG810_WDE00150_4")).toBe("半年払");
      expect(mappings.get("TEG810_WDE00150_5")).toBe("その他");
    });
  });
});
