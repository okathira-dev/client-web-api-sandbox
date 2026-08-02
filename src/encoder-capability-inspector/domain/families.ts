/**
 * ファミリーと種別（映像・音声）の対応。
 *
 * 結果一覧ではファミリー名だけが出るが、`H.264` と `Opus` が同じ列に並ぶと
 * どちらの検査なのかが読み取れない。種別はここで一元的に引く。
 */

import {
  AUDIO_FAMILIES,
  type AudioFamily,
  VIDEO_FAMILIES,
  type VideoFamily,
} from "./types";

export type MediaKind = "video" | "audio";

const VIDEO_FAMILY_SET: ReadonlySet<string> = new Set(VIDEO_FAMILIES);

export const isVideoFamily = (family: string): family is VideoFamily =>
  VIDEO_FAMILY_SET.has(family);

/** 未知のファミリーは音声側へ寄せず、映像として扱わないことだけを保証する。 */
export const getFamilyKind = (family: string): MediaKind =>
  isVideoFamily(family) ? "video" : "audio";

/** 種別 → ファミリーの順に並べるための順位。 */
export const getFamilyOrder = (family: string): number => {
  const videoIndex = VIDEO_FAMILIES.indexOf(family as VideoFamily);
  if (videoIndex >= 0) return videoIndex;
  const audioIndex = AUDIO_FAMILIES.indexOf(family as AudioFamily);
  // 音声は映像のあとへ。未知のものは末尾。
  return audioIndex >= 0
    ? VIDEO_FAMILIES.length + audioIndex
    : Number.MAX_SAFE_INTEGER;
};
