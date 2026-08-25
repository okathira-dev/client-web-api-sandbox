import {
  defineStageManifest,
  type StageModule,
} from "../../runtime/stageContract";

export const manifest = defineStageManifest({
  id: "S-060",
  name: { ja: "戻る箱と留守番箱", en: "Return and offline boxes" },
  platform: { baseline: "widely", permission: "none" },
  boxes: ["B01", "B02"],
  load: async (): Promise<StageModule> => (await import("./stage")).stage,
});
