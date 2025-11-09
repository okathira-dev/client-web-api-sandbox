/**
 * 物理的なキーボードの Backslash キーの位置
 * W3C UI Events KeyboardEvent code Values 仕様に基づく
 * @see https://www.w3.org/TR/uievents-code/
 */
export type BackslashPosition = "row1" | "row2";

/**
 * Backslash キーの位置:
 * - "row1": 2列目の最後（US/ANSI配列）
 * - "row2": 3列目の最後（ISO/JIS配列）
 */

/**
 * 物理的なキーボードの共通マップ
 * すべてのキーを row/col 形式で定義
 * - row: 0-3 (1列目から4列目)
 * - col: 基本キーは 0-11、国際化キーは -1, 12, 10
 */
export const PHYSICAL_KEYBOARD_MAP: Record<
  string,
  { row: number; col: number }
> = {
  // 1列目 (row: 0, col: 0-11)
  Digit1: { row: 0, col: 0 },
  Digit2: { row: 0, col: 1 },
  Digit3: { row: 0, col: 2 },
  Digit4: { row: 0, col: 3 },
  Digit5: { row: 0, col: 4 },
  Digit6: { row: 0, col: 5 },
  Digit7: { row: 0, col: 6 },
  Digit8: { row: 0, col: 7 },
  Digit9: { row: 0, col: 8 },
  Digit0: { row: 0, col: 9 },
  Minus: { row: 0, col: 10 },
  Equal: { row: 0, col: 11 },

  // 2列目 (row: 1, col: 0-11)
  KeyQ: { row: 1, col: 0 },
  KeyW: { row: 1, col: 1 },
  KeyE: { row: 1, col: 2 },
  KeyR: { row: 1, col: 3 },
  KeyT: { row: 1, col: 4 },
  KeyY: { row: 1, col: 5 },
  KeyU: { row: 1, col: 6 },
  KeyI: { row: 1, col: 7 },
  KeyO: { row: 1, col: 8 },
  KeyP: { row: 1, col: 9 },
  BracketLeft: { row: 1, col: 10 },
  BracketRight: { row: 1, col: 11 },

  // 3列目 (row: 2, col: 0-10)
  KeyA: { row: 2, col: 0 },
  KeyS: { row: 2, col: 1 },
  KeyD: { row: 2, col: 2 },
  KeyF: { row: 2, col: 3 },
  KeyG: { row: 2, col: 4 },
  KeyH: { row: 2, col: 5 },
  KeyJ: { row: 2, col: 6 },
  KeyK: { row: 2, col: 7 },
  KeyL: { row: 2, col: 8 },
  Semicolon: { row: 2, col: 9 },
  Quote: { row: 2, col: 10 },

  // 4列目 (row: 3, col: 0-9)
  KeyZ: { row: 3, col: 0 },
  KeyX: { row: 3, col: 1 },
  KeyC: { row: 3, col: 2 },
  KeyV: { row: 3, col: 3 },
  KeyB: { row: 3, col: 4 },
  KeyN: { row: 3, col: 5 },
  KeyM: { row: 3, col: 6 },
  Comma: { row: 3, col: 7 },
  Period: { row: 3, col: 8 },
  Slash: { row: 3, col: 9 },

  // 国際化キー（常に表示）
  IntlYen: { row: 0, col: 12 }, // 1列目の最後
  IntlBackslash: { row: 3, col: -1 }, // 4列目の最初
  IntlRo: { row: 3, col: 10 }, // 4列目の最後
};

/**
 * Backslash キーの位置マップ
 */
export const BACKSLASH_POSITIONS: Record<
  BackslashPosition,
  { row: number; col: number }
> = {
  row1: { row: 1, col: 12 }, // 2列目の最後（US/ANSI配列）
  row2: { row: 2, col: 11 }, // 3列目の最後（ISO/JIS配列）
};

/**
 * キーのcol位置を取得するヘルパー関数
 * @throws {Error} マップに存在しないキーコードが指定された場合
 */
const getKeyCol = (
  code: string,
  backslashPos: { row: number; col: number },
): number => {
  if (code === "Backslash") {
    return backslashPos.col;
  }

  const position = PHYSICAL_KEYBOARD_MAP[code];
  if (position === undefined) {
    throw new Error(
      `[getKeyCol] Unknown key code: "${code}". Please add it to PHYSICAL_KEYBOARD_MAP.`,
    );
  }

  return position.col;
};

/**
 * 表示用のキーボードレイアウトを生成
 * @param backslashPosition Backslashキーの位置
 * @returns キーボードレイアウト（行ごとのキーコード配列）
 */
export const getKeyboardLayout = (
  backslashPosition: BackslashPosition,
): string[][] => {
  const backslashPos = BACKSLASH_POSITIONS[backslashPosition];

  // 各行にBackslashキーを含むすべてのキーを収集
  const keysWithBackslash = [
    ...Object.entries(PHYSICAL_KEYBOARD_MAP),
    ["Backslash", backslashPos] as const,
  ];

  // 行ごとにグループ化してソート
  return [0, 1, 2, 3].map((rowIndex) =>
    keysWithBackslash
      .filter(([, pos]) => pos.row === rowIndex)
      .map(([code]) => code)
      .sort((a, b) => getKeyCol(a, backslashPos) - getKeyCol(b, backslashPos)),
  );
};

/**
 * 記号キーのマッピング（定数）
 */
const SYMBOL_MAP: Record<string, string> = {
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
  // 国際化キー
  IntlBackslash: "\\",
  IntlYen: "¥",
  IntlRo: "ろ",
  Backquote: "`",
} as const;

/**
 * KeyboardEvent.codeから表示用のラベルを取得
 * 例: "KeyQ" -> "Q", "Digit1" -> "1", "BracketLeft" -> "["
 */
export const getCodeLabel = (code: string): string => {
  if (code.startsWith("Key")) {
    return code.slice(3); // "KeyQ" -> "Q"
  }
  if (code.startsWith("Digit")) {
    return code.slice(5); // "Digit1" -> "1"
  }

  return SYMBOL_MAP[code] || code;
};
