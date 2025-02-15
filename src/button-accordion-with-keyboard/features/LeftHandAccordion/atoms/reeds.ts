import { createReedHooks } from "../audio/audioProcessor";

// 各リードのhooksを生成と名前付け
export const {
  useSetReedPitch: useSetSopranoReedPitch,
  usePlayReed: usePlaySopranoReed,
} = createReedHooks("soprano");

export const {
  useSetReedPitch: useSetAltoReedPitch,
  usePlayReed: usePlayAltoReed,
} = createReedHooks("alto");

export const {
  useSetReedPitch: useSetTenorReedPitch,
  usePlayReed: usePlayTenorReed,
} = createReedHooks("tenor");

export const {
  useSetReedPitch: useSetBassReedPitch,
  usePlayReed: usePlayBassReed,
} = createReedHooks("bass");
