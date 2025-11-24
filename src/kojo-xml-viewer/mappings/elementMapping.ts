/**
 * 要素マッピングの生成と管理
 */

import type { ElementMapping, TegSpecification } from "../specs/types";

/**
 * TEGコードごとの仕様書から要素マッピングを生成
 */
export function generateElementMappings(
  specification: TegSpecification,
): ElementMapping[] {
  const mappings: ElementMapping[] = [];

  // XML構造設計書と帳票フィールド仕様書を結合してマッピングを生成
  // 同じ要素コードが複数行ある場合（年、月、日など）、最初の行を優先
  const formFieldMap = new Map<
    string,
    (typeof specification.formFieldItems)[0]
  >();
  for (const field of specification.formFieldItems) {
    // 既に存在する場合はスキップ（最初の行を保持）
    if (!formFieldMap.has(field.xmlTag)) {
      formFieldMap.set(field.xmlTag, field);
    }
  }

  // XML構造設計書の各項目からマッピングを生成
  for (const item of specification.xmlStructureItems) {
    const formField = formFieldMap.get(item.tagName);
    if (!formField) {
      // 帳票フィールド仕様書にない項目も含める（レベルが深い項目など）
      continue;
    }

    // 親要素コードを取得（レベルから推測）
    let parentElementCode: string | undefined;
    const currentLevel = item.level;
    if (currentLevel > 3) {
      // 親要素を探す（同じレベルより小さい、最も近い要素）
      for (
        let i = specification.xmlStructureItems.indexOf(item) - 1;
        i >= 0;
        i--
      ) {
        const parent = specification.xmlStructureItems[i];
        if (parent.level < currentLevel) {
          parentElementCode = parent.tagName;
          break;
        }
      }
    }

    // カテゴリを決定（仕様書の「項目（グループ）名」を優先）
    let category: string | undefined;
    if (formField.groupName) {
      category = formField.groupName;
    } else if (parentElementCode) {
      const parentField = formFieldMap.get(parentElementCode);
      if (parentField) {
        category = parentField.groupName || parentField.fieldName;
      }
    }

    const mapping: ElementMapping = {
      teg: specification.tegCode,
      elementCode: item.tagName,
      label: formField.fieldName,
      category,
      inputType: formField.inputType,
      format: formField.format,
      valueRange: formField.valueRange,
      level: item.level,
      parentElementCode,
      vocabularyOrDataType: item.vocabularyOrDataType,
      repeatCount: formField.repeatCount,
    };

    mappings.push(mapping);
  }

  return mappings;
}

/**
 * 複数のTEGコードの仕様書から要素マッピングを生成
 */
export function generateAllElementMappings(
  specifications: TegSpecification[],
): ElementMapping[] {
  const allMappings: ElementMapping[] = [];
  for (const spec of specifications) {
    const mappings = generateElementMappings(spec);
    allMappings.push(...mappings);
  }
  return allMappings;
}

/**
 * 要素コードから項目名を取得
 */
export function getLabelByElementCode(
  mappings: ElementMapping[],
  elementCode: string,
): string | undefined {
  const mapping = mappings.find((m) => m.elementCode === elementCode);
  return mapping?.label;
}

/**
 * TEGコードから該当する要素マッピングを取得
 */
export function getMappingsByTeg(
  mappings: ElementMapping[],
  teg: string,
): ElementMapping[] {
  return mappings.filter((m) => m.teg === teg);
}

/**
 * カテゴリごとに要素マッピングをグループ化
 */
export function getMappingsByCategory(
  mappings: ElementMapping[],
): Record<string, ElementMapping[]> {
  const grouped: Record<string, ElementMapping[]> = {};
  mappings.forEach((mapping) => {
    const category = mapping.category || "その他";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(mapping);
  });
  return grouped;
}

/**
 * 要素コードからTEGコードを取得
 */
export function getTegByElementCode(
  mappings: ElementMapping[],
  elementCode: string,
): string | undefined {
  const mapping = mappings.find((m) => m.elementCode === elementCode);
  return mapping?.teg;
}
