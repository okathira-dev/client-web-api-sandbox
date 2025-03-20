// eslint-disable-next-line import-x/no-named-as-default
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import jaTranslation from "./locales/ja/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ja: {
    translation: jaTranslation,
  },
} as const;

// eslint-disable-next-line import-x/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources,
  lng: "ja", // デフォルトの言語
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
