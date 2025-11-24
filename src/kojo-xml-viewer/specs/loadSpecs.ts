/**
 * 仕様書データの読み込み
 */

import { loadXsdFile, parseXsdElement } from "./parsers/xsdParser";
import { generateElementMappingsFromXsd } from "../mappings/elementMappingFromXsd";

import type {
  FormFieldItem,
  FormFieldMetadata,
  TegSpecification,
  XmlStructureItem,
  XmlStructureMetadata,
} from "./types";

/**
 * XSDからメタデータを抽出
 */
function extractMetadataFromXsd(
  doc: Document,
  tegCode: string,
): {
  formName: string;
  version: string | undefined;
} {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const documentation = doc.getElementsByTagNameNS(xsdNs, "documentation")[0];

  let formName = tegCode;
  let version: string | undefined;

  if (documentation) {
    const text = documentation.textContent || "";
    // 様式名：生命保険料控除証明書
    // version：1.1
    // Date：2020年08月31日
    const formNameMatch = text.match(/様式名[：:]\s*(.+)/);
    if (formNameMatch && formNameMatch[1]) {
      formName = formNameMatch[1].trim();
    }

    const versionMatch = text.match(/version[：:]\s*(.+)/);
    if (versionMatch && versionMatch[1]) {
      version = versionMatch[1].trim();
    }
  }

  return { formName, version };
}

/**
 * XSDからXML構造設計書の項目を生成
 */
function generateXmlStructureItems(
  doc: Document,
  _tegCode: string,
): XmlStructureItem[] {
  const xsdNs = "http://www.w3.org/2001/XMLSchema";
  const rootElements = doc.getElementsByTagNameNS(xsdNs, "element");
  if (rootElements.length === 0) {
    return [];
  }

  const rootElement = rootElements[0];
  if (!rootElement) {
    return [];
  }

  const rootInfo = parseXsdElement(rootElement, undefined, doc);
  const items: XmlStructureItem[] = [];
  let index = 1;

  function flattenElement(
    elementInfo: typeof rootInfo,
    level: number,
    _parentTagName?: string,
  ): void {
    const item: XmlStructureItem = {
      index: index++,
      level,
      elementContent: [],
      tagName: elementInfo.name,
      vocabularyOrDataType: elementInfo.type,
      minOccurrence: elementInfo.minOccurs,
      maxOccurrence:
        elementInfo.maxOccurs === "unbounded"
          ? undefined
          : elementInfo.maxOccurs,
    };

    items.push(item);

    // 子要素を再帰的に処理
    for (const child of elementInfo.children) {
      flattenElement(child, level + 1, elementInfo.name);
    }
  }

  flattenElement(rootInfo, 3); // レベル3から開始

  return items;
}

/**
 * XSDから帳票フィールド仕様書の項目を生成
 */
function generateFormFieldItems(
  mappings: Array<{
    elementCode: string;
    label: string;
    inputType?: string;
    category?: string;
    repeatCount?: number;
    format?: string;
    valueRange?: string;
  }>,
): FormFieldItem[] {
  const items: FormFieldItem[] = [];
  let index = 1;

  for (const mapping of mappings) {
    const item: FormFieldItem = {
      index: index++,
      inputType: mapping.inputType || "文字",
      fieldName: mapping.label,
      groupName: mapping.category,
      xmlTag: mapping.elementCode,
      repeatCount: mapping.repeatCount,
      format: mapping.format,
      valueRange: mapping.valueRange,
    };

    items.push(item);
  }

  return items;
}

/**
 * XSDベースの仕様書データを読み込む
 */
export async function loadTegSpecificationFromXsd(
  tegCode: string,
): Promise<TegSpecification> {
  const doc = await loadXsdFile(tegCode);
  const { formName, version } = extractMetadataFromXsd(doc, tegCode);

  // 名前空間を取得
  const schema = doc.documentElement;
  const namespace = schema.getAttribute("targetNamespace") || undefined;

  // XML構造設計書のメタデータ
  const xmlStructureMetadata: XmlStructureMetadata = {
    formName,
    tegCode,
    version,
    namespace,
  };

  // XML構造設計書の項目を生成
  const xmlStructureItems = generateXmlStructureItems(doc, tegCode);

  // 要素マッピングを生成
  const mappings = await generateElementMappingsFromXsd(tegCode);

  // 帳票フィールド仕様書のメタデータ
  const formFieldMetadata: FormFieldMetadata = {
    formName,
    tegCode,
    version,
  };

  // 帳票フィールド仕様書の項目を生成
  const formFieldItems = generateFormFieldItems(mappings);

  return {
    tegCode,
    xmlStructureMetadata,
    xmlStructureItems,
    formFieldMetadata,
    formFieldItems,
  };
}

export { AVAILABLE_TEG_CODES } from "./getAvailableTegCodes";
