import { XMLParser } from "fast-xml-parser";

import type {
  ParsedXml,
  XmlNode,
  XmlDeclaration,
  StylesheetDeclaration,
  TegElementAttributes,
  XmlSignature,
} from "../types/xml";

// fast-xml-parserの設定
const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: false,
  parseTagValue: false, // 値をパースしない（文字列として保持）
  trimValues: false, // 先頭のゼロを保持するため、trimしない
  ignoreNameSpace: false,
  removeNSPrefix: false,
  parseTrueNumberOnly: false,
  arrayMode: false,
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: true, // XML宣言を無視
  ignorePiTags: false,
  preserveOrder: false,
  alwaysCreateTextNode: true, // テキストノードを常に作成
};

const parser = new XMLParser(parserOptions);

/**
 * XML文字列をパースしてXmlNode構造に変換する
 */
function jsonToXmlNode(json: unknown): XmlNode | null {
  if (typeof json !== "object" || json === null) {
    return null;
  }

  // オブジェクトのキーを取得
  const keys = Object.keys(json);

  if (keys.length === 0) {
    return null;
  }

  // ルート要素を探す（XML宣言やPIタグをスキップ）
  // XML宣言は通常 "?xml" というキーになる
  // 処理命令（PI）は "?" で始まるキーになる
  let rootKey: string | undefined;
  for (const key of keys) {
    // XML宣言や処理命令をスキップ
    if (!key.startsWith("?")) {
      rootKey = key;
      break;
    }
  }

  // ルート要素が見つからない場合、最初のキーを使用
  if (!rootKey) {
    rootKey = keys[0];
  }

  if (!rootKey) {
    return null;
  }

  const rootValue = json[rootKey as keyof typeof json];

  if (typeof rootValue !== "object" || rootValue === null) {
    return null;
  }

  return processNode(rootKey, rootValue);
}

/**
 * ノードを処理してXmlNodeに変換
 * シンプルな実装：テキスト値を持つ子要素を正しく処理
 */
function processNode(name: string, value: unknown): XmlNode {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? { name, text: trimmed } : { name };
  }

  if (typeof value !== "object" || value === null) {
    return { name };
  }

  const obj = value as Record<string, unknown>;
  const node: XmlNode = { name };
  const children: XmlNode[] = [];
  const attributes: Record<string, string> = {};
  let textContent: string | undefined;

  for (const [key, val] of Object.entries(obj)) {
    if (key === "#text") {
      let rawText: string | undefined;
      if (typeof val === "string") {
        rawText = val;
      } else if (typeof val === "number") {
        rawText = String(val);
      } else if (val != null) {
        if (typeof val === "object") {
          rawText = JSON.stringify(val);
        } else {
          throw new Error(
            `Unexpected type for #text value: ${typeof val}. Expected string, number, object, or null.`,
          );
        }
      }
      if (rawText) {
        const trimmed = rawText.trim();
        if (trimmed.length > 0) {
          textContent = trimmed;
        }
      }
      continue;
    }

    if (key === "@_") {
      if (typeof val === "object" && val !== null) {
        for (const [attrName, attrValue] of Object.entries(
          val as Record<string, unknown>,
        )) {
          attributes[attrName] = String(attrValue);
        }
      }
      continue;
    }

    if (key.startsWith("@_")) {
      const attrName = key.substring(2);
      attributes[attrName] = String(val);
      continue;
    }

    if (Array.isArray(val)) {
      for (const item of val) {
        const child = processNode(key, item);
        children.push(child);
      }
      continue;
    }

    const child = processNode(key, val);
    children.push(child);
  }

  if (textContent) {
    node.text = textContent;
  }

  if (Object.keys(attributes).length > 0) {
    node.attributes = attributes;
  }

  if (children.length > 0) {
    node.children = children;
  }

  return node;
}

/**
 * XML宣言を抽出する
 */
function extractXmlDeclaration(
  json: Record<string, unknown>,
): XmlDeclaration | undefined {
  const xmlKey = Object.keys(json).find((key) => key === "?xml");
  if (!xmlKey) {
    return undefined;
  }

  const xmlValue = json[xmlKey];
  if (typeof xmlValue === "object" && xmlValue !== null) {
    const attrs = xmlValue as Record<string, string>;
    return {
      version: attrs["@_version"] || attrs.version,
      encoding: attrs["@_encoding"] || attrs.encoding,
    };
  }

  return undefined;
}

/**
 * スタイルシート宣言を抽出する
 */
function extractStylesheetDeclaration(
  json: Record<string, unknown>,
): StylesheetDeclaration | undefined {
  const stylesheetKey = Object.keys(json).find(
    (key) => key === "?xml-stylesheet" || key.startsWith("?xml-stylesheet"),
  );
  if (!stylesheetKey) {
    return undefined;
  }

  const stylesheetValue = json[stylesheetKey];
  if (typeof stylesheetValue === "object" && stylesheetValue !== null) {
    const attrs = stylesheetValue as Record<string, string>;
    return {
      type: attrs["@_type"] || attrs.type,
      href: attrs["@_href"] || attrs.href,
    };
  }

  return undefined;
}

/**
 * 様式ID要素の属性を抽出する
 */
function extractTegAttributes(root: XmlNode): TegElementAttributes | undefined {
  if (!root.attributes) {
    return undefined;
  }

  const attrs = root.attributes;
  const tegAttrs: TegElementAttributes = {};

  if (attrs.VR) {
    tegAttrs.VR = attrs.VR;
  }
  if (attrs.id) {
    tegAttrs.id = attrs.id;
  }
  if (attrs.page) {
    tegAttrs.page = attrs.page;
  }
  if (attrs.sakuseiDay) {
    tegAttrs.sakuseiDay = attrs.sakuseiDay;
  }
  if (attrs.sakuseiNM) {
    tegAttrs.sakuseiNM = attrs.sakuseiNM;
  }
  if (attrs.softNM) {
    tegAttrs.softNM = attrs.softNM;
  }

  // 属性が1つもない場合はundefinedを返す
  if (Object.keys(tegAttrs).length === 0) {
    return undefined;
  }

  return tegAttrs;
}

/**
 * XML署名を抽出する
 */
function extractSignature(root: XmlNode): XmlSignature {
  // dsig:Signature要素を探す
  function findSignatureNode(node: XmlNode): XmlNode | undefined {
    if (node.name === "dsig:Signature" || node.name === "Signature") {
      return node;
    }

    if (node.children) {
      for (const child of node.children) {
        const found = findSignatureNode(child);
        if (found) {
          return found;
        }
      }
    }

    return undefined;
  }

  const signatureNode = findSignatureNode(root);

  if (!signatureNode) {
    return { exists: false };
  }

  // ReferenceタグのURI属性を探す
  let referenceUri: string | undefined;
  function findReferenceUri(node: XmlNode): void {
    if (node.name === "dsig:Reference" || node.name === "Reference") {
      if (node.attributes?.URI) {
        referenceUri = node.attributes.URI;
      }
      return;
    }

    if (node.children) {
      for (const child of node.children) {
        findReferenceUri(child);
      }
    }
  }

  findReferenceUri(signatureNode);

  return {
    exists: true,
    signatureNode,
    referenceUri,
  };
}

/**
 * XML文字列をパースする
 */
export function parseXml(xmlString: string): ParsedXml {
  try {
    const json = parser.parse(xmlString) as Record<string, unknown>;
    const root = jsonToXmlNode(json);

    if (!root) {
      return {
        root: { name: "error", text: "XMLの解析に失敗しました" },
        isValid: false,
        error: `ルート要素が見つかりませんでした。利用可能なキー: ${Object.keys(json).join(", ")}`,
      };
    }

    // XML宣言を抽出
    const xmlDeclaration = extractXmlDeclaration(json);

    // スタイルシート宣言を抽出
    const stylesheetDeclaration = extractStylesheetDeclaration(json);

    // ルート要素の属性を抽出
    const rootAttributes = extractTegAttributes(root);

    // XML署名を抽出
    const signature = extractSignature(root);

    return {
      root,
      isValid: true,
      xmlDeclaration,
      stylesheetDeclaration,
      rootAttributes,
      signature,
    };
  } catch (error) {
    return {
      root: { name: "error", text: "XMLの解析に失敗しました" },
      isValid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
