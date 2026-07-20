import { stageCatalogue } from "../domain/stages";
import { stageMapClusters } from "./StageMap";

describe("stage map clusters", () => {
  it("places every catalogue stage in exactly one cluster", () => {
    const clusteredIds = stageMapClusters.flatMap(
      (cluster) => cluster.stageIds,
    );
    const catalogueIds = stageCatalogue.map((stage) => stage.id);

    expect(new Set(clusteredIds).size).toBe(clusteredIds.length);
    expect([...clusteredIds].sort()).toEqual([...catalogueIds].sort());
  });

  it("keeps each compact cluster small enough for a two-column overview", () => {
    expect(stageMapClusters).toHaveLength(6);
    for (const cluster of stageMapClusters) {
      expect(cluster.stageIds.length).toBeGreaterThan(0);
      expect(cluster.stageIds.length).toBeLessThanOrEqual(12);
    }
  });
});
