/**
 * 要素マッピングの生成と管理
 */

import type { ElementMapping } from "../specs/types";

/**
 * TEGコードから該当する要素マッピングを取得
 */
export function getMappingsByTeg(
  mappings: ElementMapping[],
  teg: string,
): ElementMapping[] {
  return mappings.filter((m) => m.teg === teg);
}
