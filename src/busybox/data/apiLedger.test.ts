import { readFileSync } from "node:fs";

interface LedgerItem {
  name: string;
  disposition: "stage" | "integrate" | "hold" | "exclude";
  reason: string;
  stageIds: string[];
}

interface ApiLedger {
  verifiedOn: string;
  summary: {
    familyCount: number;
    interfaceCount: number;
    unclassified: number;
  };
  families: LedgerItem[];
  interfaces: LedgerItem[];
}

const ledger = JSON.parse(
  readFileSync(new URL("./api-ledger.json", import.meta.url), "utf8"),
) as ApiLedger;

describe("Busybox MDN API ledger", () => {
  it("classifies the entire captured MDN and BCD population", () => {
    expect(ledger.summary.unclassified).toBe(0);
    expect(ledger.families).toHaveLength(ledger.summary.familyCount);
    expect(ledger.interfaces).toHaveLength(ledger.summary.interfaceCount);
    expect(ledger.summary.familyCount).toBeGreaterThanOrEqual(147);
    expect(ledger.summary.interfaceCount).toBeGreaterThanOrEqual(1045);
    for (const item of [...ledger.families, ...ledger.interfaces]) {
      expect(item.name).not.toBe("");
      expect(item.reason).not.toBe("");
      expect(["stage", "integrate", "hold", "exclude"]).toContain(
        item.disposition,
      );
      if (item.disposition === "stage")
        expect(item.stageIds.length).toBeGreaterThan(0);
    }
  });
});
