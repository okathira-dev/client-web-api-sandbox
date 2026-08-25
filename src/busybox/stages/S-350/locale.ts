import { defineStageLocale } from "../locale";

/** S-350 のステージ固有コピー。表示文言はここから追加する。 */
export const locale = defineStageLocale({
  stageName: { ja: "映像の手触り", en: "Touching the timeline" },
  videoToOperate: { ja: "操作する映像", en: "Video to operate" },
  B01: { ja: "シークの箱", en: "Seek box" },
  B02: { ja: "ミュートの箱", en: "Mute box" },
  B03: { ja: "再生と停止の箱", en: "Play-pause box" },
  B04: { ja: "再生速度の箱", en: "Playback-rate box" },
  B05: { ja: "字幕trackの箱", en: "Caption-track box" },
  B06: { ja: "小窓の箱", en: "Picture-in-picture box" },
  B08: { ja: "全画面の箱", en: "Fullscreen box" },
});
