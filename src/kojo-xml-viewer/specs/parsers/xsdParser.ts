/**
 * XSDパーサー
 */

import { DOMParser } from "@xmldom/xmldom";

/**
 * XSD要素情報
 */
export interface XsdElementInfo {
  name: string;
  japaneseName?: string;
  type: string;
  minOccurs: number;
  maxOccurs: number | "unbounded";
  isRequired: boolean;
  children: XsdElementInfo[];
  parent?: XsdElementInfo;
  enumValues?: string[];
  maxLength?: number;
  pattern?: string;
}

/**
 * XSDファイルを読み込んでDOMに変換
 */
export async function loadXsdFile(tegCode: string): Promise<Document> {
  // Viteの静的アセットとして扱うため、new URL()を使用
  const xsdPath = new URL(
    `../../kojoall/04XMLスキーマ/kyotsu/${tegCode}-001.xsd`,
    import.meta.url,
  );
  const xsdUrl = xsdPath.href;

  let xmlText: string;
  let errorPath: string;

  // file://プロトコルの場合（テスト環境）はファイルシステムから読み込む
  if (xsdPath.protocol === "file:") {
    // Node.js環境: ファイルシステムから読み込む
    const { fileURLToPath } = await import("node:url");
    const { readFileSync } = await import("node:fs");
    const filePath = fileURLToPath(xsdPath);
    errorPath = filePath;
    try {
      xmlText = readFileSync(filePath, "utf-8");
    } catch (_error) {
      throw new Error(
        `XSDファイルが見つかりません: ${filePath}\n` +
          `TEGコード ${tegCode} に対応するXSDファイルが存在しない可能性があります。`,
      );
    }
  } else {
    // ブラウザ環境: fetchを使用
    errorPath = xsdUrl;
    const response = await fetch(xsdUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          `XSDファイルが見つかりません: ${xsdUrl}\n` +
            `TEGコード ${tegCode} に対応するXSDファイルが存在しない可能性があります。`,
        );
      }
      throw new Error(
        `Failed to load XSD file: ${xsdUrl} (${response.status} ${response.statusText})`,
      );
    }
    xmlText = await response.text();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  // パースエラーのチェック
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error(`Failed to parse XSD file: ${errorPath}`);
  }

  return doc;
}

/**
 * General.xsdファイルを読み込んでDOMに変換
 */
export async function loadGeneralXsd(): Promise<Document> {
  // Viteの静的アセットとして扱うため、new URL()を使用
  const xsdPath = new URL(
    `../../kojoall/04XMLスキーマ/general/General.xsd`,
    import.meta.url,
  );
  const xsdUrl = xsdPath.href;

  let xmlText: string;
  let errorPath: string;

  // file://プロトコルの場合（テスト環境）はファイルシステムから読み込む
  if (xsdPath.protocol === "file:") {
    // Node.js環境: ファイルシステムから読み込む
    const { fileURLToPath } = await import("node:url");
    const { readFileSync } = await import("node:fs");
    const filePath = fileURLToPath(xsdPath);
    errorPath = filePath;
    try {
      xmlText = readFileSync(filePath, "utf-8");
    } catch (_error) {
      throw new Error(`General.xsdファイルが見つかりません: ${filePath}`);
    }
  } else {
    // ブラウザ環境: fetchを使用
    errorPath = xsdUrl;
    const response = await fetch(xsdUrl);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`General.xsdファイルが見つかりません: ${xsdUrl}`);
      }
      throw new Error(
        `Failed to load General.xsd file: ${xsdUrl} (${response.status} ${response.statusText})`,
      );
    }
    xmlText = await response.text();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  // パースエラーのチェック
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error(`Failed to parse General.xsd file: ${errorPath}`);
  }

  return doc;
}

/**
 * XSD要素から日本語名を取得
 */
function getJapaneseName(element: Element): string | undefined {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const annotation = element.getElementsByTagNameNS(xsdNs, "annotation")[0];
  if (!annotation) {
    return undefined;
  }

  const appinfo = annotation.getElementsByTagNameNS(xsdNs, "appinfo")[0];
  if (!appinfo) {
    return undefined;
  }

  const text = appinfo.textContent || "";
  // 引用符を除去
  return text.replace(/^["']|["']$/g, "").trim() || undefined;
}

/**
 * XSD要素から型情報を取得
 */
function getType(element: Element, _doc?: Document): string {
  const typeAttr = element.getAttribute("type");
  if (typeAttr) {
    return typeAttr;
  }

  // type属性がない場合、complexTypeを探す
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const complexType = element.getElementsByTagNameNS(xsdNs, "complexType")[0];
  if (complexType) {
    const nameAttr = complexType.getAttribute("name");
    if (nameAttr) {
      return nameAttr;
    }
    // 匿名complexTypeの場合は、親要素名から推測
    const parentElement = element.parentElement;
    if (parentElement) {
      const parentName = parentElement.getAttribute("name");
      if (parentName) {
        return `${parentName}-type`;
      }
    }
  }

  return "string";
}

/**
 * XSDドキュメントからcomplexTypeを取得
 */
function findComplexType(doc: Document, typeName: string): Element | null {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const complexTypes = doc.getElementsByTagNameNS(xsdNs, "complexType");
  for (let i = 0; i < complexTypes.length; i++) {
    const complexType = complexTypes[i];
    if (!complexType) {
      continue;
    }
    if (complexType.getAttribute("name") === typeName) {
      return complexType;
    }
  }
  return null;
}

/**
 * XSD要素から出現回数を取得
 */
function getOccurs(element: Element): {
  minOccurs: number;
  maxOccurs: number | "unbounded";
} {
  const minOccursAttr = element.getAttribute("minOccurs");
  const maxOccursAttr = element.getAttribute("maxOccurs");

  const minOccurs = minOccursAttr ? parseInt(minOccursAttr, 10) : 1;
  const maxOccurs =
    maxOccursAttr === "unbounded"
      ? "unbounded"
      : maxOccursAttr
        ? parseInt(maxOccursAttr, 10)
        : 1;

  return { minOccurs, maxOccurs };
}

/**
 * XSD要素から列挙値を取得
 */
function getEnumValues(element: Element): string[] | undefined {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const restriction = element.getElementsByTagNameNS(xsdNs, "restriction")[0];
  if (!restriction) {
    return undefined;
  }

  const enumerations = restriction.getElementsByTagNameNS(xsdNs, "enumeration");
  if (enumerations.length === 0) {
    return undefined;
  }

  const values: string[] = [];
  for (let i = 0; i < enumerations.length; i++) {
    const enumeration = enumerations[i];
    if (!enumeration) {
      continue;
    }
    const valueAttr = enumeration.getAttribute("value");
    if (valueAttr) {
      values.push(valueAttr);
    }
  }

  return values.length > 0 ? values : undefined;
}

/**
 * XSD要素から文字数制限を取得
 */
function getMaxLength(element: Element): number | undefined {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const restriction = element.getElementsByTagNameNS(xsdNs, "restriction")[0];
  if (!restriction) {
    return undefined;
  }

  const maxLength = restriction.getElementsByTagNameNS(xsdNs, "maxLength")[0];
  if (!maxLength) {
    return undefined;
  }

  const valueAttr = maxLength.getAttribute("value");
  return valueAttr ? parseInt(valueAttr, 10) : undefined;
}

/**
 * XSD要素情報を抽出
 */
export function parseXsdElement(
  element: Element,
  parent?: XsdElementInfo,
  doc?: Document,
): XsdElementInfo {
  const name = element.getAttribute("name") || "";
  const japaneseName = getJapaneseName(element);
  const type = getType(element, doc);
  const { minOccurs, maxOccurs } = getOccurs(element);
  const isRequired = minOccurs > 0;

  const elementInfo: XsdElementInfo = {
    name,
    japaneseName,
    type,
    minOccurs,
    maxOccurs,
    isRequired,
    children: [],
    parent,
  };

  // 列挙値を取得
  const enumValues = getEnumValues(element);
  if (enumValues) {
    elementInfo.enumValues = enumValues;
  }

  // 文字数制限を取得
  const maxLength = getMaxLength(element);
  if (maxLength) {
    elementInfo.maxLength = maxLength;
  }

  // 子要素を取得
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  let complexType: Element | null = null;

  // まず、要素内のcomplexTypeを探す
  const inlineComplexType = element.getElementsByTagNameNS(
    xsdNs,
    "complexType",
  )[0];
  if (inlineComplexType) {
    complexType = inlineComplexType;
  } else if (doc && type) {
    // type属性で参照されているcomplexTypeを探す
    // type名から名前空間プレフィックスを除去（例: "TEG800-1-1type"）
    const typeName = type.split(":").pop() || type;
    complexType = findComplexType(doc, typeName);
  }

  if (complexType) {
    const sequence = complexType.getElementsByTagNameNS(xsdNs, "sequence")[0];
    if (sequence) {
      const childElements = sequence.getElementsByTagNameNS(xsdNs, "element");
      for (let i = 0; i < childElements.length; i++) {
        const childElement = childElements[i];
        if (!childElement) {
          continue;
        }
        const childInfo = parseXsdElement(childElement, elementInfo, doc);
        elementInfo.children.push(childInfo);
      }
    }
  }

  return elementInfo;
}

/**
 * XSDから要素マッピングを生成
 */
export async function parseXsdToElementMappings(tegCode: string): Promise<
  Array<{
    elementCode: string;
    label: string;
    parentElementCode?: string;
    repeatCount?: number;
  }>
> {
  const doc = await loadXsdFile(tegCode);
  const xsdNs = "http://www.w3.org/2001/XMLSchema";

  // ルート要素を取得
  const rootElements = doc.getElementsByTagNameNS(xsdNs, "element");
  if (rootElements.length === 0) {
    throw new Error(`ルート要素が見つかりません: ${tegCode}`);
  }

  const rootElement = rootElements[0];
  if (!rootElement) {
    throw new Error(`ルート要素が取得できません: ${tegCode}`);
  }
  const rootInfo = parseXsdElement(rootElement, undefined, doc);

  // 階層構造を平坦化してマッピングを生成
  const mappings: Array<{
    elementCode: string;
    label: string;
    parentElementCode?: string;
    repeatCount?: number;
  }> = [];

  function flattenElement(
    elementInfo: XsdElementInfo,
    parentCode?: string,
  ): void {
    const repeatCount =
      elementInfo.maxOccurs === "unbounded" || elementInfo.maxOccurs > 1
        ? elementInfo.maxOccurs === "unbounded"
          ? undefined
          : elementInfo.maxOccurs
        : undefined;

    mappings.push({
      elementCode: elementInfo.name,
      label: elementInfo.japaneseName || elementInfo.name,
      parentElementCode: parentCode,
      repeatCount,
    });

    // 子要素を再帰的に処理
    for (const child of elementInfo.children) {
      flattenElement(child, elementInfo.name);
    }
  }

  flattenElement(rootInfo);

  return mappings;
}

/**
 * General.xsdからgen:要素のラベルマッピングを生成
 * 要素名（プレフィックスなし）をキー、日本語ラベルを値とするMapを返す
 */
export async function loadGeneralElementLabels(): Promise<Map<string, string>> {
  const doc = await loadGeneralXsd();
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  // const generalNs = "http://xml.e-tax.nta.go.jp/XSD/general";
  const labelMap = new Map<string, string>();

  // simpleTypeからラベルを取得
  const simpleTypes = doc.getElementsByTagNameNS(xsdNs, "simpleType");
  for (let i = 0; i < simpleTypes.length; i++) {
    const simpleType = simpleTypes[i];
    if (!simpleType) {
      continue;
    }
    const name = simpleType.getAttribute("name");
    if (!name) {
      continue;
    }
    const japaneseName = getJapaneseName(simpleType);
    if (japaneseName) {
      labelMap.set(name, japaneseName);
    }
  }

  // complexTypeからラベルを取得
  const complexTypes = doc.getElementsByTagNameNS(xsdNs, "complexType");
  for (let i = 0; i < complexTypes.length; i++) {
    const complexType = complexTypes[i];
    if (!complexType) {
      continue;
    }
    const name = complexType.getAttribute("name");
    if (!name) {
      continue;
    }
    const japaneseName = getJapaneseName(complexType);
    if (japaneseName) {
      labelMap.set(name, japaneseName);
    }
  }

  // group内のelementからラベルを取得
  const groups = doc.getElementsByTagNameNS(xsdNs, "group");
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!group) {
      continue;
    }
    // group自体のラベル
    const groupName = group.getAttribute("name");
    const groupLabel = getJapaneseName(group);
    if (groupName && groupLabel) {
      labelMap.set(groupName, groupLabel);
    }

    // group内のelementのラベル
    const sequence = group.getElementsByTagNameNS(xsdNs, "sequence")[0];
    if (sequence) {
      const elements = sequence.getElementsByTagNameNS(xsdNs, "element");
      for (let j = 0; j < elements.length; j++) {
        const element = elements[j];
        if (!element) {
          continue;
        }
        const elementName = element.getAttribute("name");
        if (!elementName) {
          continue;
        }
        const elementLabel = getJapaneseName(element);
        if (elementLabel) {
          labelMap.set(elementName, elementLabel);
        }
      }
    }
  }

  // complexType内のelementからラベルを取得
  for (let i = 0; i < complexTypes.length; i++) {
    const complexType = complexTypes[i];
    if (!complexType) {
      continue;
    }
    const sequence = complexType.getElementsByTagNameNS(xsdNs, "sequence")[0];
    if (sequence) {
      const elements = sequence.getElementsByTagNameNS(xsdNs, "element");
      for (let j = 0; j < elements.length; j++) {
        const element = elements[j];
        if (!element) {
          continue;
        }
        const elementName = element.getAttribute("name");
        if (!elementName) {
          continue;
        }
        const elementLabel = getJapaneseName(element);
        if (elementLabel) {
          labelMap.set(elementName, elementLabel);
        }
      }
    }
  }

  return labelMap;
}
