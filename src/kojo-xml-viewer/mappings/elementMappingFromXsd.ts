/**
 * XSDベースの要素マッピング生成
 */

import { loadXsdFile, parseXsdElement } from "../specs/parsers/xsdParser";

import type { ElementMapping } from "../specs/types";

/**
 * XSDから要素マッピングを生成
 */
export async function generateElementMappingsFromXsd(
  tegCode: string,
): Promise<ElementMapping[]> {
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

  // 階層構造を平坦化してElementMapping[]を生成
  const mappings: ElementMapping[] = [];

  function flattenElement(
    elementInfo: typeof rootInfo,
    parentCode?: string,
    level = 1,
  ): void {
    // ルート要素（TEG800など）はスキップしない（マッピングに含める）
    const repeatCount =
      elementInfo.maxOccurs === "unbounded" || elementInfo.maxOccurs > 1
        ? elementInfo.maxOccurs === "unbounded"
          ? undefined
          : elementInfo.maxOccurs
        : undefined;

    // 入力型を推測
    let inputType: string | undefined;
    if (elementInfo.enumValues && elementInfo.enumValues.length > 0) {
      inputType = "区分";
    } else if (
      elementInfo.type.includes("long") ||
      elementInfo.type.includes("decimal") ||
      elementInfo.type.includes("kingaku")
    ) {
      inputType = "数値";
    } else {
      // デフォルトは文字列だが、明示的に設定しない（既存の実装に合わせる）
      inputType = undefined;
    }

    // カテゴリを決定（親要素の日本語名を使用）
    let category: string | undefined;
    if (parentCode) {
      // 親要素の日本語名を取得
      const parentMapping = mappings.find((m) => m.elementCode === parentCode);
      if (parentMapping && parentMapping.label) {
        category = parentMapping.label;
      }
    }

    const mapping: ElementMapping = {
      teg: tegCode,
      elementCode: elementInfo.name,
      label: elementInfo.japaneseName || elementInfo.name,
      category,
      inputType,
      level,
      parentElementCode: parentCode,
      vocabularyOrDataType: elementInfo.type,
      repeatCount,
    };

    mappings.push(mapping);

    // 子要素を再帰的に処理
    for (const child of elementInfo.children) {
      flattenElement(child, elementInfo.name, level + 1);
    }
  }

  flattenElement(rootInfo);

  return mappings;
}
