import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetRoot = resolve(root, "src/busybox/fixtures/unicode");

for (const file of [
  "fonts/unifont-17.0.05-bmp-subset.woff2",
  "fonts/unifont-17.0.05-upper-subset.woff2",
]) {
  const bytes = await readFile(resolve(assetRoot, file));
  if (bytes.subarray(0, 4).toString("ascii") !== "wOF2") {
    throw new Error(`${file} is not a WOFF2 font.`);
  }
}

const license = await readFile(resolve(assetRoot, "fonts/OFL-1.1.txt"), "utf8");
if (
  !license.includes("Copyright © 1998-2025") ||
  !license.includes("SIL OPEN FONT LICENSE Version 1.1")
) {
  throw new Error("The redistributed Unifont license text is incomplete.");
}

console.log("Unicode fixture, WOFF2 signatures, and font license verified.");
const fixtureSource = await readFile(resolve(assetRoot, "data.ts"), "utf8");
if (!fixtureSource.includes("unicodeFixtures")) {
  throw new Error("The Unicode product fixture is missing its exported data.");
}
