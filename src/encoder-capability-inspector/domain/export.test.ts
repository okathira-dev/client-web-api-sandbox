import { reportFixture, videoResultFixture } from "./__fixtures__/results";
import { buildExportFileName, buildReportExport } from "./export";

describe("buildReportExport", () => {
  it("drops the carried-over report so the same results are not written twice", () => {
    const exported = buildReportExport(
      reportFixture({ previousCompleted: reportFixture() }),
    );
    expect(exported.report).not.toHaveProperty("previousCompleted");
  });

  it("moves the report version onto the envelope", () => {
    const exported = buildReportExport(reportFixture({ version: 3 }));
    expect(exported.reportVersion).toBe(3);
    expect(exported.report).not.toHaveProperty("version");
  });

  it("keeps the results and the environment as they are", () => {
    const results = [videoResultFixture({ id: "a" })];
    const report = reportFixture({ results });
    const exported = buildReportExport(report);
    expect(exported.report.results).toEqual(results);
    expect(exported.report.environment).toEqual(report.environment);
  });

  it("records when it was exported", () => {
    const exported = buildReportExport(
      reportFixture(),
      new Date(Date.UTC(2026, 7, 2, 6, 30)),
    );
    expect(exported.exportedAt).toBe("2026-08-02T06:30:00.000Z");
    expect(exported.tool).toBe("encoder-capability-inspector");
  });

  it("survives a round trip through JSON", () => {
    const exported = buildReportExport(reportFixture());
    expect(JSON.parse(JSON.stringify(exported))).toEqual(exported);
  });
});

describe("buildExportFileName", () => {
  it("sorts chronologically when the files are listed by name", () => {
    // ローカル時刻で組み立てるので、月・日・時・分の桁を揃える。
    expect(buildExportFileName(new Date(2026, 7, 2, 9, 5))).toBe(
      "encoder-capability-20260802-0905.json",
    );
    expect(buildExportFileName(new Date(2026, 11, 31, 23, 59))).toBe(
      "encoder-capability-20261231-2359.json",
    );
  });
});
