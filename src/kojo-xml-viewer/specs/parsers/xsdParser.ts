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
  // viteの静的アセットとして扱うため、new URL(url, import.meta.url)を使用。引数に直接書く必要がある。
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
  // viteの静的アセットとして扱うため、new URL(url, import.meta.url)を使用。引数に直接書く必要がある。
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
 * XSD要素から値のマッピングを取得（xsd:documentationから）
 * 例: "1：明治\n2：大正" → Map("1" => "明治", "2" => "大正")
 */
function getValueMapping(element: Element): Map<string, string> | undefined {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const annotation = element.getElementsByTagNameNS(xsdNs, "annotation")[0];
  if (!annotation) {
    return undefined;
  }

  const documentation = annotation.getElementsByTagNameNS(
    xsdNs,
    "documentation",
  )[0];
  if (!documentation) {
    return undefined;
  }

  const text = documentation.textContent || "";
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return undefined;
  }

  const mapping = new Map<string, string>();
  for (const line of lines) {
    // "1：明治" または "1:明治" の形式をパース
    const match = line.match(/^(\d+)[：:]\s*(.+)$/);
    if (match && match[1] && match[2]) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && value) {
        mapping.set(key, value);
      }
    }
  }

  return mapping.size > 0 ? mapping : undefined;
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
 * General.xsdからgen:要素のラベルマッピングと値のマッピングを生成
 */
export interface GeneralElementInfo {
  label: string;
  valueMapping?: Map<string, string>;
}

/**
 * General.xsdからgen:要素のラベルマッピングを生成
 * 要素名（プレフィックスなし）をキー、日本語ラベルを値とするMapを返す
 */
export async function loadGeneralElementLabels(): Promise<Map<string, string>> {
  const info = await loadGeneralElementInfo();
  const labelMap = new Map<string, string>();
  for (const [key, value] of info.entries()) {
    labelMap.set(key, value.label);
  }
  return labelMap;
}

/**
 * xsd:includeで参照されているファイルを読み込む
 */
async function loadIncludedXsd(
  _basePath: string,
  schemaLocation: string,
): Promise<Document> {
  // schemaLocationは相対パス（例: "../general/zeimoku.xsd"）
  // General.xsdと同じディレクトリにあるので、直接パスを構築
  // "../general/zeimoku.xsd" -> "zeimoku.xsd"
  const fileName = schemaLocation.replace(/^\.\.\/general\//, "");
  // viteの静的アセットとして扱うため、new URL(url, import.meta.url)を使用。引数に直接書く必要がある。
  const xsdPath = new URL(
    `../../kojoall/04XMLスキーマ/general/${fileName}`,
    import.meta.url,
  );
  const xsdUrl = xsdPath.href;

  let xmlText: string;

  if (xsdPath.protocol === "file:") {
    const { fileURLToPath } = await import("node:url");
    const { readFileSync } = await import("node:fs");
    const filePath = fileURLToPath(xsdPath);
    xmlText = readFileSync(filePath, "utf-8");
  } else {
    const response = await fetch(xsdUrl);
    if (!response.ok) {
      throw new Error(`Failed to load included XSD: ${xsdUrl}`);
    }
    xmlText = await response.text();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error(`Failed to parse included XSD: ${xsdUrl}`);
  }

  return doc;
}

/**
 * General.xsdからgen:要素の情報（ラベルと値のマッピング）を生成
 * xsd:includeで参照されているファイルも読み込む
 */
export async function loadGeneralElementInfo(): Promise<
  Map<string, GeneralElementInfo>
> {
  const baseDoc = await loadGeneralXsd();
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const infoMap = new Map<string, GeneralElementInfo>();

  // xsd:includeで参照されているファイルも読み込む
  const includes = baseDoc.getElementsByTagNameNS(xsdNs, "include");
  const includedDocs: Document[] = [];

  for (let i = 0; i < includes.length; i++) {
    const include = includes[i];
    if (!include) {
      continue;
    }
    const schemaLocation = include.getAttribute("schemaLocation");
    if (schemaLocation) {
      try {
        const includedDoc = await loadIncludedXsd("", schemaLocation);
        includedDocs.push(includedDoc);
      } catch (err) {
        // includeの読み込みエラーは警告のみ（必須ではない）
        console.warn(`Failed to load included XSD: ${schemaLocation}`, err);
      }
    }
  }

  // すべてのドキュメント（baseDoc + includedDocs）から要素情報を取得
  const allDocs = [baseDoc, ...includedDocs];

  for (const doc of allDocs) {
    // simpleTypeからラベルと値のマッピングを取得
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
      const valueMapping = getValueMapping(simpleType);
      if (japaneseName) {
        infoMap.set(name, {
          label: japaneseName,
          valueMapping,
        });
      }
    }
  }

  for (const doc of allDocs) {
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
        infoMap.set(name, {
          label: japaneseName,
        });
      }
    }

    // group内のelementからラベルと値のマッピングを取得
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
        infoMap.set(groupName, {
          label: groupLabel,
        });
      }

      // group内のelementのラベルと値のマッピング
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
          const valueMapping = getValueMapping(element);
          if (elementLabel) {
            infoMap.set(elementName, {
              label: elementLabel,
              valueMapping,
            });
          }
        }
      }
    }

    // complexType内のelementからラベルと値のマッピングを取得
    const complexTypesForElements = doc.getElementsByTagNameNS(
      xsdNs,
      "complexType",
    );
    for (let i = 0; i < complexTypesForElements.length; i++) {
      const complexType = complexTypesForElements[i];
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
          // elementのannotationからラベルを取得
          let elementLabel = getJapaneseName(element);
          let valueMapping = getValueMapping(element);

          // element内にsimpleTypeがある場合、そのsimpleTypeのannotationも確認
          const simpleType = element.getElementsByTagNameNS(
            xsdNs,
            "simpleType",
          )[0];
          if (simpleType) {
            // simpleTypeのannotationからラベルを取得（elementにラベルがない場合）
            if (!elementLabel) {
              elementLabel = getJapaneseName(simpleType);
            }
            // simpleTypeのannotationから値のマッピングを取得（elementにマッピングがない場合）
            if (!valueMapping) {
              valueMapping = getValueMapping(simpleType);
            }
          }

          // ラベルまたは値のマッピングがある場合は登録
          if (elementLabel || valueMapping) {
            infoMap.set(elementName, {
              label: elementLabel || elementName,
              valueMapping,
            });
          }
        }
      }
    }
  }

  return infoMap;
}
