import type { Locale } from "../i18n";

export type StageLocaleText = Readonly<{ ja: string; en: string }>;

/** ステージ隣接localeの値を、表示側の言語へ射影する。 */
export function stageText(locale: Locale, value: StageLocaleText): string {
  return value[locale];
}
