// eslint-disable-next-line import-x/no-named-as-default
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation";
import jaTranslation from "./locales/ja/translation";

const resources = {
  en: {
    translation: enTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
} as const;

// eslint-disable-next-line import-x/no-named-as-default-member
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // ユーザーの入力はないため、エスケープ処理は不要
    },
  });

export default i18n;
