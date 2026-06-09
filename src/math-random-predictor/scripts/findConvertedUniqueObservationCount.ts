/**
 * 変換系列で一意解になる最小観測数を探索する。
 *
 * 方針: 大きい N ほど区間制約が強く推測しやすいため、
 * 既定では N を大きい順に試し、各 N では観測数を多い方から減らして上限を見つけてから、
 * 1..上限 の二分探索で最小観測数を求める。
 *
 * 実行例:
 *   npm run math-random:find-converted-unique
 *   npm run math-random:find-converted-unique -- --n 4096 --seed 1337 --cache-offset 0
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_LARGE_N_CANDIDATES,
  findConvertedUniqueFixture,
} from "./convertedUniqueSearch";

const MAX_OBSERVATIONS = 4096;
const DEFAULT_SEED = 1337n;
const DEFAULT_CACHE_OFFSET = 0;
const DEFAULT_TIMEOUT_MS = 30_000;

const parseArgs = (argv: readonly string[]): Record<string, string> => {
  const options: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const current = argv[i];
    if (current === undefined || !current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${key} の値が必要です。`);
    }
    options[key] = value;
    i++;
  }
  return options;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const fixedN = args.n !== undefined ? Number(args.n) : undefined;
  const seed = BigInt(args.seed ?? DEFAULT_SEED);
  const cacheOffset = Number(args["cache-offset"] ?? DEFAULT_CACHE_OFFSET);
  const timeoutMs = Number(args.timeout ?? DEFAULT_TIMEOUT_MS);

  if (fixedN !== undefined && (!Number.isInteger(fixedN) || fixedN < 2)) {
    throw new Error("--n は 2 以上の整数が必要です。");
  }

  console.info(
    `探索開始: seed=${seed} cacheOffset=${cacheOffset} maxObservations=${MAX_OBSERVATIONS}` +
      (fixedN !== undefined ? ` n=${fixedN}` : " (N は大きい順に試行)"),
  );

  const fixture = await findConvertedUniqueFixture({
    seed,
    cacheOffset,
    timeoutMs,
    maxObservations: MAX_OBSERVATIONS,
    nCandidates: [...DEFAULT_LARGE_N_CANDIDATES],
    fixedN,
    onLog: (message) => console.info(message),
  });

  if (fixture === null) {
    console.info(
      JSON.stringify(
        {
          seed: seed.toString(),
          cacheOffset,
          minObservationCount: null,
        },
        null,
        2,
      ),
    );
    console.info("一意解になる条件は見つかりませんでした。");
    process.exitCode = 1;
    return;
  }

  console.info(JSON.stringify(fixture, null, 2));

  const fixtureDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "../test-fixtures",
  );
  const fixturePath = join(fixtureDir, "convertedUniqueFixture.json");
  await mkdir(fixtureDir, { recursive: true });
  await writeFile(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`);
  console.info(`fixture を書き込みました: ${fixturePath}`);
};

const isCliEntry =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isCliEntry) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
