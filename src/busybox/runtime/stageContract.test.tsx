import { readdirSync } from "node:fs";
import { join } from "node:path";
import MouseOutlined from "@mui/icons-material/MouseOutlined";
import { stageIndex } from "./stage-index.generated";
import {
  defineStageManifest,
  defineStageModule,
  type StageManifest,
  type StageModule,
} from "./stageContract";

const manifest: StageManifest<"S-999", readonly ["B01", "B02"]> =
  defineStageManifest({
    id: "S-999",
    name: { ja: "契約確認", en: "Contract check" },
    platform: { baseline: "widely", permission: "none" },
    boxes: ["B01", "B02"],
    load: async (): Promise<StageModule> => stage,
  });

function ContractStage() {
  return <div>stage contract</div>;
}

const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: MouseOutlined,
      tone: "blue",
      label: { ja: "一箱目", en: "First box" },
    },
    [manifest.box.B02]: {
      icon: MouseOutlined,
      tone: "green",
      label: { ja: "二箱目", en: "Second box" },
    },
  },
  Component: ContractStage,
});

describe("stage contract", () => {
  it("keeps local box IDs with their stage manifest", async () => {
    expect(manifest.id).toBe("S-999");
    expect(manifest.boxIds).toEqual(["B01", "B02"]);
    expect(manifest.box.B01).toBe("B01");
    expect((await manifest.load()).boxes).toBe(stage.boxes);
  });

  it("keeps the stage component associated with the module", () => {
    expect(stage.Component).toBe(ContractStage);
  });

  it("publishes exactly the stage directories and derives totals from local box IDs", async () => {
    const stageDirectory = join(process.cwd(), "src", "busybox", "stages");
    const stageDirectoryIds = readdirSync(stageDirectory)
      .filter((name) => /^S-\d{3}$/.test(name))
      .sort();

    expect(stageIndex.map((stage) => stage.id)).toEqual(stageDirectoryIds);
    expect(new Set(stageIndex.map((stage) => stage.id)).size).toBe(
      stageIndex.length,
    );
    expect(stageIndex.flatMap((stage) => stage.boxIds)).not.toHaveLength(0);

    for (const manifest of stageIndex) {
      expect(new Set(manifest.boxIds).size).toBe(manifest.boxIds.length);
      const module = await manifest.load();
      expect(module.id).toBe(manifest.id);
      expect(Object.keys(module.boxes).sort()).toEqual(
        [...manifest.boxIds].sort(),
      );
    }
  });
});
