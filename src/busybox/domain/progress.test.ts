import {
  createProgressDocument,
  mergeProgressDocuments,
  parseProgressDocument,
  solveBox,
} from "./progress";

const first = "2026-01-01T00:00:00.000Z";
const second = "2026-01-02T00:00:00.000Z";
const third = "2026-01-03T00:00:00.000Z";

describe("Busybox progress", () => {
  it("creates an empty versioned document", () => {
    expect(createProgressDocument("ja", first, "install-a")).toEqual({
      schemaVersion: 1,
      installationId: "install-a",
      createdAt: first,
      updatedAt: first,
      boxes: {},
      observations: {},
      settings: { locale: "ja" },
    });
  });

  it("never regresses solved boxes when documents merge", () => {
    const local = solveBox(
      createProgressDocument("ja", first, "a"),
      "S-000-B01",
      ["click"],
      second,
    );
    const remote = solveBox(
      createProgressDocument("en", first, "b"),
      "S-020-B01",
      ["fit"],
      second,
    );
    const merged = mergeProgressDocuments(local, remote, third);

    expect(Object.keys(merged.boxes).sort()).toEqual([
      "S-000-B01",
      "S-020-B01",
    ]);
    expect(merged.settings.locale).toBe("ja");
    expect(merged.updatedAt).toBe(third);
  });

  it("keeps the earliest solve and unions observations", () => {
    const base = createProgressDocument("en", first, "a");
    const local = solveBox(base, "S-010-B01", ["mouse"], second);
    const remote = solveBox(base, "S-010-B01", ["pointer"], first);
    const merged = mergeProgressDocuments(local, remote, third);

    expect(merged.boxes["S-010-B01"]).toMatchObject({
      solvedAt: first,
      facts: ["mouse", "pointer"],
    });
  });

  it("migrates the documented version zero shape", () => {
    const result = parseProgressDocument({
      schemaVersion: 0,
      installationId: "old-install",
      createdAt: first,
      locale: "ja",
      solvedBoxes: ["S-000-B01"],
    });
    expect(result.status).toBe("valid");
    if (result.status === "valid") {
      expect(result.migrated).toBe(true);
      expect(result.document.boxes["S-000-B01"]?.solvedAt).toBe(first);
    }
  });

  it("protects future and corrupt documents from overwrite", () => {
    expect(parseProgressDocument({ schemaVersion: 99 })).toEqual({
      status: "future",
      version: 99,
    });
    expect(parseProgressDocument({ schemaVersion: 1, boxes: "nope" })).toEqual({
      status: "corrupt",
      reason: "required-fields",
    });
  });

  it("preserves unknown fields within the current version", () => {
    const parsed = parseProgressDocument({
      ...createProgressDocument("en", first, "a"),
      futureObservation: { safe: true },
    });
    expect(parsed.status).toBe("valid");
    if (parsed.status === "valid") {
      expect(parsed.document.futureObservation).toEqual({ safe: true });
    }
  });
});
