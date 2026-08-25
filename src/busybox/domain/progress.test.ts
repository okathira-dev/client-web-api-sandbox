import {
  createProgressDocument,
  hasStageMarker,
  markStage,
  mergeProgressDocuments,
  parseProgressDocument,
  solveBox,
} from "./progress";

describe("Busybox progress", () => {
  it("creates an empty stage-scoped document", () => {
    expect(createProgressDocument("ja", "install-a")).toEqual({
      schemaVersion: 1,
      installationId: "install-a",
      stages: {},
      settings: { locale: "ja" },
    });
  });

  it("never regresses solved boxes when documents merge", () => {
    const local = solveBox(createProgressDocument("ja", "a"), "S-000", "B01");
    const remote = solveBox(createProgressDocument("en", "b"), "S-020", "B01");
    const merged = mergeProgressDocuments(local, remote);

    expect(merged.stages).toEqual({
      "S-000": { solvedBoxIds: ["B01"] },
      "S-020": { solvedBoxIds: ["B01"] },
    });
    expect(merged.settings.locale).toBe("ja");
  });

  it("unions box clears and stage markers", () => {
    const base = createProgressDocument("en", "a");
    const local = markStage(solveBox(base, "S-010", "B01"), "S-010", "entered");
    const remote = solveBox(base, "S-010", "B02");
    const merged = mergeProgressDocuments(local, remote);

    expect(merged.stages["S-010"]).toEqual({
      solvedBoxIds: ["B01", "B02"],
      markers: ["entered"],
    });
    expect(hasStageMarker(merged, "S-010", "entered")).toBe(true);
  });

  it("rejects old development saves instead of carrying migration code", () => {
    expect(
      parseProgressDocument({
        schemaVersion: 1,
        installationId: "old-install",
        boxes: {},
        settings: { locale: "ja" },
      }),
    ).toEqual({ status: "corrupt", reason: "required-fields" });
  });

  it("protects future documents from overwrite", () => {
    expect(parseProgressDocument({ schemaVersion: 99 })).toEqual({
      status: "future",
      version: 99,
    });
  });

  it("normalizes duplicate persisted IDs", () => {
    const parsed = parseProgressDocument({
      schemaVersion: 1,
      installationId: "install-a",
      stages: {
        "S-000": { solvedBoxIds: ["B01", "B01"], markers: ["seen", "seen"] },
      },
      settings: { locale: "en" },
    });

    expect(parsed).toEqual({
      status: "valid",
      document: {
        schemaVersion: 1,
        installationId: "install-a",
        stages: {
          "S-000": { solvedBoxIds: ["B01"], markers: ["seen"] },
        },
        settings: { locale: "en" },
      },
    });
  });
});
