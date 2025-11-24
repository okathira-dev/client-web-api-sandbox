/**
 * 利用可能なTEGコードのリストを取得
 * HTMLファイルの存在から動的に生成
 */

/**
 * 利用可能なTEGコードのリスト
 * 実際のHTMLファイルの存在に基づいて動的に生成することも可能
 */
export const AVAILABLE_TEG_CODES = [
  "TEG104",
  "TEG105",
  "TEG106",
  "TEG107",
  "TEG108",
  "TEG800",
  "TEG810",
  "TEG820",
  "TEG821",
  "TEG822",
  "TEG830",
  "TEG840",
  "TEG850",
] as const;

/**
 * TEGコードが利用可能かどうかを確認
 */
export function isTegCodeAvailable(tegCode: string): boolean {
  return (AVAILABLE_TEG_CODES as readonly string[]).includes(tegCode);
}
