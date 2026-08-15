import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const licenseRoot = new URL("../public/busybox/licenses/", import.meta.url);

function text(url: URL) {
  return readFileSync(url, "utf8").replaceAll("\r\n", "\n");
}

function dependencyLicense(name: string) {
  const regular = new URL(
    `../../node_modules/${name}/LICENSE`,
    import.meta.url,
  );
  if (existsSync(fileURLToPath(regular))) return regular;
  // Codex's hermetic workspace keeps installed packages under .ignored.
  return new URL(
    `../../node_modules/.ignored/${name}/LICENSE`,
    import.meta.url,
  );
}

describe("Busybox third-party license distribution", () => {
  it.each([
    ["jsqr-Apache-2.0.txt", dependencyLicense("jsqr")],
    ["mediabunny-MPL-2.0.txt", dependencyLicense("mediabunny")],
    ["unifont-OFL-1.1.txt", "./fixtures/unicode/fonts/OFL-1.1.txt"],
  ])("ships an unmodified copy of %s", (distributed, source) => {
    expect(text(new URL(distributed, licenseRoot))).toBe(
      typeof source === "string"
        ? text(new URL(source, import.meta.url))
        : text(source),
    );
  });

  it("links the pinned versions, source code, and license texts", () => {
    const page = text(new URL("index.html", licenseRoot));
    expect(page).toContain("jsQR 1.4.0");
    expect(page).toContain("cozmo/jsQR/tree/v1.4.0");
    expect(page).toContain("MediaBunny 1.52.3");
    expect(page).toContain("Vanilagy/mediabunny/tree/v1.52.3");
    expect(page).toContain("GNU Unifont 17.0.05 subsets");
    expect(page).toContain("unifont-OFL-1.1.txt");
  });
});
