import { defineStageLocale } from "../locale";

/** S-330 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "消えない灯り", en: "The light that stays" },
  keepAwake: { ja: "灯りを保つ", en: "Keep the light awake" },
  returnAfterAcquire: {
    ja: "取得後にタブを隠し、戻る。",
    en: "After acquiring, hide the tab and return.",
  },
  holding: { ja: "保持中", en: "Holding" },
  reacquired: { ja: "再取得済み", en: "Reacquired" },
  released: { ja: "解放済み", en: "Released" },
  unavailable: { ja: "Wake Lockを利用できません", en: "Wake Lock unavailable" },
  B01: { ja: "灯りを保つ箱", en: "Wake-lock box" },
  B02: { ja: "灯りを戻す箱", en: "Wake-lock return box" },
});
