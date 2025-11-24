/**
 * XSDパーサーのテスト
 */

import {
  loadXsdFile,
  parseXsdElement,
  parseXsdToElementMappings,
} from "./xsdParser";

describe("xsdParser", () => {
  describe("loadXsdFile", () => {
    it("XSDファイルを読み込んでDOMに変換できること", async () => {
      const doc = await loadXsdFile("TEG800");
      expect(doc).toBeDefined();
      expect(doc.documentElement).toBeDefined();
      expect(doc.documentElement.nodeName).toBe("xsd:schema");
    });

    it("名前空間が正しく処理されること", async () => {
      const doc = await loadXsdFile("TEG800");
      const schema = doc.documentElement;
      expect(schema.getAttribute("targetNamespace")).toBe(
        "http://xml.e-tax.nta.go.jp/XSD/kyotsu",
      );
      expect(schema.getAttribute("xmlns:gen")).toBe(
        "http://xml.e-tax.nta.go.jp/XSD/general",
      );
    });

    it("エラーハンドリング（ファイルが見つからない場合）", async () => {
      await expect(loadXsdFile("TEG999")).rejects.toThrow();
    });
  });

  describe("parseXsdElement", () => {
    it("ルート要素（TEG800）を取得できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const rootElement = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "element",
      )[0];
      expect(rootElement).toBeDefined();
      if (!rootElement) {
        throw new Error("rootElement is undefined");
      }
      expect(rootElement.getAttribute("name")).toBe("TEG800");

      const elementInfo = parseXsdElement(rootElement);
      expect(elementInfo.name).toBe("TEG800");
      expect(elementInfo.type).toBe("TEG800-1-1type");
    });

    it("メタデータ（帳票名称、バージョン）をxsd:documentationから抽出できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const documentation = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "documentation",
      )[0];
      expect(documentation).toBeDefined();
      if (!documentation) {
        throw new Error("documentation is undefined");
      }
      const text = documentation.textContent || "";
      expect(text).toContain("生命保険料控除証明書");
      expect(text).toContain("version：1.1");
    });

    it("各要素のxsd:appinfoから日本語名を取得できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const elements = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "element",
      );

      // WCA00000要素を探す
      let wcaElement: Element | null = null;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element && element.getAttribute("name") === "WCA00000") {
          wcaElement = element;
          break;
        }
      }

      expect(wcaElement).toBeDefined();
      if (!wcaElement) {
        throw new Error("wcaElement is undefined");
      }
      const elementInfo = parseXsdElement(wcaElement);
      expect(elementInfo.japaneseName).toBe("保険会社名");
    });

    it("minOccurs/maxOccursを取得できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const elements = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "element",
      );

      // WCB00000要素（minOccurs="0"）を探す
      let wcbElement: Element | null = null;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element && element.getAttribute("name") === "WCB00000") {
          wcbElement = element;
          break;
        }
      }

      expect(wcbElement).toBeDefined();
      if (!wcbElement) {
        throw new Error("wcbElement is undefined");
      }
      const elementInfo = parseXsdElement(wcbElement);
      expect(elementInfo.minOccurs).toBe(0);
      expect(elementInfo.isRequired).toBe(false);

      // WCE00000要素（maxOccurs="100"）を探す
      let wceElement: Element | null = null;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element && element.getAttribute("name") === "WCE00000") {
          wceElement = element;
          break;
        }
      }

      expect(wceElement).toBeDefined();
      if (!wceElement) {
        throw new Error("wceElement is undefined");
      }
      const wceElementInfo = parseXsdElement(wceElement);
      expect(wceElementInfo.maxOccurs).toBe(100);
    });

    it("型情報（@type）を取得できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const elements = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "element",
      );

      // WCA00000要素を探す
      let wcaElement: Element | null = null;
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (element && element.getAttribute("name") === "WCA00000") {
          wcaElement = element;
          break;
        }
      }

      expect(wcaElement).toBeDefined();
      if (!wcaElement) {
        throw new Error("wcaElement is undefined");
      }
      const elementInfo = parseXsdElement(wcaElement);
      expect(elementInfo.type).toBe("gen:name");
    });

    it("階層構造（親子関係）を取得できること", async () => {
      const doc = await loadXsdFile("TEG800");
      const rootElement = doc.getElementsByTagNameNS(
        "http://www.w3.org/2001/XMLSchema",
        "element",
      )[0];

      if (!rootElement) {
        throw new Error("rootElement is undefined");
      }

      const rootInfo = parseXsdElement(rootElement, undefined, doc);
      expect(rootInfo.children.length).toBeGreaterThan(0);
      const firstChild = rootInfo.children[0];
      expect(firstChild).toBeDefined();
      if (!firstChild) {
        throw new Error("firstChild is undefined");
      }
      expect(firstChild.name).toBe("WCA00000");
      expect(firstChild.parent).toBeDefined();
      expect(firstChild.parent?.name).toBe("TEG800");
    });
  });

  describe("parseXsdToElementMappings", () => {
    it("TEG800のXSDから要素マッピングを生成できること", async () => {
      const mappings = await parseXsdToElementMappings("TEG800");
      expect(mappings.length).toBeGreaterThan(0);

      // ルート要素が含まれていることを確認
      const rootMapping = mappings.find((m) => m.elementCode === "TEG800");
      expect(rootMapping).toBeDefined();

      // WCA00000要素が含まれていることを確認
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping).toBeDefined();
      expect(wcaMapping?.label).toBe("保険会社名");
    });

    it("日本語名が正しく設定されること", async () => {
      const mappings = await parseXsdToElementMappings("TEG800");
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping?.label).toBe("保険会社名");
    });

    it("親子関係が正しく設定されること", async () => {
      const mappings = await parseXsdToElementMappings("TEG800");
      const wcaMapping = mappings.find((m) => m.elementCode === "WCA00000");
      expect(wcaMapping?.parentElementCode).toBe("TEG800");
    });

    it("出現回数が正しく設定されること", async () => {
      const mappings = await parseXsdToElementMappings("TEG800");
      const wceMapping = mappings.find((m) => m.elementCode === "WCE00000");
      expect(wceMapping?.repeatCount).toBe(100);
    });
  });
});
