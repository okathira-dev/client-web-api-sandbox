import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation";
import jaTranslation from "./locales/ja/translation";

const resources = {
  en: { translation: enTranslation },
  ja: { translation: jaTranslation },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      // 表示するのは自前の定数と計測値だけで、ユーザー入力を差し込む箇所はない。
      escapeValue: false,
    },
  });

export default i18n;
