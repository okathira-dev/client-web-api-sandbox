import { readFileSync } from "node:fs";
import path from "node:path";

import { combineDateValues, extractElementValues } from "./formDataBuilder";
import { parseXml } from "../../../utils/xmlParser";

import type { XmlNode } from "../../../types/xml";

const SAMPLE_DIR = path.resolve(
  process.cwd(),
  "src",
  "kojo-xml-viewer",
  "sample",
);

function loadSample(fileName: string): XmlNode {
  const filePath = path.join(SAMPLE_DIR, fileName);
  const xml = readFileSync(filePath, "utf-8");
  const parsed = parseXml(xml);
  if (!parsed.isValid) {
    throw new Error(`Failed to parse sample XML: ${fileName}`);
  }
  return parsed.root;
}

describe("extractElementValues", () => {
  it("stores deeply nested insurance values once", () => {
    const root = loadSample("TEG800_生命保険料控除証明書_202511月.xml");
    const values = new Map<string, string>();

    extractElementValues(root, values);

    expect(values.get("WCE00330")).toBe("000005678");
    expect(values.get("WCE00340")).toBe("000000003");
    expect(values.get("WCE00350")).toBe("000005675");
    expect(values.get("WCE00370")).toBe("000006789");
    expect(values.get("WCE00380")).toBe("000000004");
    expect(values.get("WCE00390")).toBe("000006785");
    expect(values.has("TEG800")).toBe(false);
  });

  it("captures namespace-based date fragments and combines them", () => {
    const root = loadSample("TEG800_生命保険料控除証明書_202511月.xml");
    const values = new Map<string, string>();
    extractElementValues(root, values);

    expect(values.get("WCC00000_gen:yyyy")).toBe("2025");
    expect(values.get("WCC00000_gen:mm")).toBe("11");
    expect(values.get("WCC00000_gen:dd")).toBe("12");

    expect(combineDateValues(values, "WCC00000")).toBe("2025年11月12日");
    expect(combineDateValues(values, "WCE00210")).toBe("2025年10月");
    expect(combineDateValues(values, "WCE00010")).toBe("2025年");
  });
});
