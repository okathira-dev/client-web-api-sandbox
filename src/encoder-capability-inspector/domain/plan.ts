/** 候補行列から実行単位（InspectionUnit）を組み立てる。 */

import { AUDIO_CANDIDATES, VIDEO_CANDIDATES } from "../consts/candidates";
import {
  type AudioInspectionUnit,
  HARDWARE_PREFERENCES,
  type InspectionUnit,
  type VideoFamily,
  type VideoInspectionUnit,
} from "./types";

/**
 * 同じ codec string でも、ハードウェア優先・ソフトウェア優先・実装任せで
 * 結果が変わるため、方針ごとに別の実行単位として扱う。
 */
export const buildVideoInspectionUnits = (): VideoInspectionUnit[] =>
  VIDEO_CANDIDATES.flatMap((candidate) =>
    HARDWARE_PREFERENCES.map(
      (hardwareAcceleration) =>
        ({
          ...candidate,
          kind: "video",
          id: `video:${candidate.codec}:${hardwareAcceleration}`,
          hardwareAcceleration,
        }) satisfies VideoInspectionUnit,
    ),
  );

export const buildAudioInspectionUnits = (): AudioInspectionUnit[] =>
  AUDIO_CANDIDATES.map(
    (candidate) =>
      ({
        ...candidate,
        kind: "audio",
        id: `audio:${candidate.candidateId}`,
      }) satisfies AudioInspectionUnit,
  );

export const buildFullInspectionPlan = (): InspectionUnit[] => [
  ...buildVideoInspectionUnits(),
  ...buildAudioInspectionUnits(),
];

export const findInspectionUnits = (
  ids: Iterable<string>,
): InspectionUnit[] => {
  const wanted = new Set(ids);
  return buildFullInspectionPlan().filter((unit) => wanted.has(unit.id));
};

export const getVideoCandidatesForFamily = (family: VideoFamily) =>
  VIDEO_CANDIDATES.filter((candidate) => candidate.family === family);
