import { readFileSync } from "node:fs";
import path from "node:path";

import { parseXml } from "./xmlParser";

import type { XmlNode } from "../types/xml";

const SAMPLE_DIR = path.resolve(
  process.cwd(),
  "src",
  "kojo-xml-viewer",
  "sample",
);

function loadSample(fileName: string): string {
  const filePath = path.join(SAMPLE_DIR, fileName);
  return readFileSync(filePath, "utf-8");
}

function findNodeByPath(
  node: XmlNode,
  segments: string[],
  depth = 0,
): XmlNode | null {
  if (node.name !== segments[depth]) {
    return null;
  }

  if (depth === segments.length - 1) {
    return node;
  }

  if (!node.children) {
    return null;
  }

  for (const child of node.children) {
    const found = findNodeByPath(child, segments, depth + 1);
    if (found) {
      return found;
    }
  }

  return null;
}

function getNodeText(root: XmlNode, segments: string[]): string | undefined {
  return findNodeByPath(root, segments)?.text;
}

describe("xmlParser", () => {
  it("parses nested values inside insurance sections", () => {
    const xml = loadSample("TEG800_生命保険料控除証明書_202511月.xml");
    const parsed = parseXml(xml);

    expect(parsed.isValid).toBe(true);

    const basePath = ["TEG800", "WCE00000", "WCE00190", "WCE00310", "WCE00320"];

    expect(getNodeText(parsed.root, [...basePath, "WCE00330"])).toBe(
      "000005678",
    );
    expect(getNodeText(parsed.root, [...basePath, "WCE00340"])).toBe(
      "000000003",
    );
    expect(getNodeText(parsed.root, [...basePath, "WCE00350"])).toBe(
      "000005675",
    );

    const medicalPath = [
      "TEG800",
      "WCE00000",
      "WCE00190",
      "WCE00310",
      "WCE00360",
    ];
    expect(getNodeText(parsed.root, [...medicalPath, "WCE00370"])).toBe(
      "000006789",
    );
    expect(getNodeText(parsed.root, [...medicalPath, "WCE00380"])).toBe(
      "000000004",
    );
    expect(getNodeText(parsed.root, [...medicalPath, "WCE00390"])).toBe(
      "000006785",
    );
  });

  it("preserves namespace children such as gen:yyyy/mm/dd", () => {
    const xml = loadSample("TEG800_生命保険料控除証明書_202511月.xml");
    const parsed = parseXml(xml);

    expect(getNodeText(parsed.root, ["TEG800", "WCC00000", "gen:yyyy"])).toBe(
      "2025",
    );
    expect(getNodeText(parsed.root, ["TEG800", "WCC00000", "gen:mm"])).toBe(
      "11",
    );
    expect(getNodeText(parsed.root, ["TEG800", "WCC00000", "gen:dd"])).toBe(
      "12",
    );
  });
});
