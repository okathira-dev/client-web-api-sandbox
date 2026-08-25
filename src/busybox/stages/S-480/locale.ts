import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "文字と好みの四季", en: "Text scales and preferences" },
  B01: { ja: "小の箱", en: "Small box" },
  B02: { ja: "標準の箱", en: "Standard box" },
  B03: { ja: "大の箱", en: "Large box" },
  B04: { ja: "特大の箱", en: "Extra-large box" },
  B05: { ja: "暗色の箱", en: "Dark box" },
  B06: { ja: "強調の箱", en: "Contrast box" },
  B07: { ja: "静止の箱", en: "Reduced-motion box" },
  B08: { ja: "不透明の箱", en: "Reduced-transparency box" },
  B09: { ja: "節約の箱", en: "Reduced-data box" },
  colorSchemeAction: { ja: "暗色へ", en: "Request dark" },
  contrastAction: { ja: "輪郭を強く", en: "Request more contrast" },
  motionAction: { ja: "動きを止める", en: "Request reduced motion" },
  transparencyAction: {
    ja: "透明を減らす",
    en: "Request reduced transparency",
  },
  dataAction: { ja: "通信を軽く", en: "Request reduced data" },
  clearPreferences: { ja: "上書きを戻す", en: "Clear overrides" },
  preferenceIdle: {
    ja: "下段は対応browserの設定要求です。",
    en: "The lower row requests browser-managed preferences.",
  },
  preferenceUnavailable: {
    ja: "この設定のUser Preferences APIは利用できません。",
    en: "This User Preferences setting is unavailable.",
  },
  preferenceInvalid: {
    ja: "browserが要求値を公開していません。",
    en: "The browser does not expose the requested value.",
  },
  preferenceApplied: {
    ja: "browserの設定と表示が切り替わりました。",
    en: "The browser preference and rendering changed.",
  },
  preferenceNotEffective: {
    ja: "要求は完了しましたが表示へ反映されていません。",
    en: "The request completed without changing the effective media query.",
  },
  preferenceRejected: {
    ja: "設定要求は拒否または取消されました。",
    en: "The preference request was rejected or cancelled.",
  },
  preferenceCleared: {
    ja: "このステージの上書きを戻しました。",
    en: "Stage preference overrides were cleared.",
  },
});
