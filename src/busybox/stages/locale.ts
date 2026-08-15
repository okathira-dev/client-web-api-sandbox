import type { Locale } from "../i18n";

export type StageLocaleText = Readonly<{ ja: string; en: string }>;

/** ステージの表示文言を、そのステージの隣に閉じ込めるための型。 */
export type StageLocaleBundle = Readonly<Record<string, StageLocaleText>>;

/** 推論されたキーを保持したまま、locale bundleを定義する。 */
export function defineStageLocale<T extends StageLocaleBundle>(value: T): T {
  return value;
}

/** ステージ隣接localeの値を、表示側の言語へ射影する。 */
export function stageText(locale: Locale, value: StageLocaleText): string {
  return value[locale];
}
