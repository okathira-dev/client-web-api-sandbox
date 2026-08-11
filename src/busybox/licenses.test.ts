import { readFileSync } from "node:fs";

const licenseRoot = new URL("../public/busybox/licenses/", import.meta.url);

function text(url: URL) {
  return readFileSync(url, "utf8").replaceAll("\r\n", "\n");
}

describe("Busybox third-party license distribution", () => {
  it.each([
    ["jsqr-Apache-2.0.txt", "../../node_modules/jsqr/LICENSE"],
    ["mediabunny-MPL-2.0.txt", "../../node_modules/mediabunny/LICENSE"],
    ["unifont-OFL-1.1.txt", "./fixtures/unicode/fonts/OFL-1.1.txt"],
  ])("ships an unmodified copy of %s", (distributed, source) => {
    expect(text(new URL(distributed, licenseRoot))).toBe(
      text(new URL(source, import.meta.url)),
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
