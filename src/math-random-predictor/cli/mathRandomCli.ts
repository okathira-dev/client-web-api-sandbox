import {
  parseConvertedObservations,
  parseRawObservations,
} from "../domain/observations";
import {
  estimateConvertedObservationProgress,
  estimateRawObservationProgress,
} from "../domain/theory";
import {
  createV8CurrentGeneratorFromSeed,
  floorRandom,
  V8_CURRENT_MODEL,
} from "../domain/v8Current";
import { solveV8CurrentObservations } from "../solver/v8CurrentSolver";

type CliIo = {
  readonly write: (line: string) => void;
  readonly writeError?: (line: string) => void;
};

type ObservationSeriesKind = "raw" | "converted";

type ParsedArgs = {
  readonly command?: string;
  readonly options: Record<string, string>;
};

/**
 * CLI 引数を、先頭 command と `--key value` 形式の option map に分解する。
 */
const parseArgs = (argv: readonly string[]): ParsedArgs => {
  const [command, ...rest] = argv;
  const options: Record<string, string> = {};
  for (let i = 0; i < rest.length; i++) {
    const current = rest[i];
    if (current === undefined || !current.startsWith("--")) {
      continue;
    }
    const key = current.slice(2);
    const value = rest[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`--${key} の値が必要です。`);
    }
    options[key] = value;
    i++;
  }
  return { command, options };
};

/**
 * 正の整数 option を読み取り、省略時は default value を返す。
 */
const parsePositiveIntegerOption = (
  value: string | undefined,
  optionName: string,
  defaultValue: number,
): number => {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`--${optionName} は 1 以上の整数が必要です。`);
  }
  return parsed;
};

/**
 * `--seed` option を BigInt として読み取る。
 */
const parseSeedOption = (value: string | undefined): bigint => {
  if (value === undefined) {
    throw new Error("--seed が必要です。");
  }
  try {
    return BigInt(value);
  } catch {
    throw new Error(`--seed は整数が必要です: ${value}`);
  }
};

/**
 * `--cache-offset` option を、既知 offset または `"unknown"` に変換する。
 */
const parseCacheOffsetOption = (
  value: string | undefined,
): number | "unknown" => {
  if (value === undefined || value === "unknown") {
    return "unknown";
  }
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed >= V8_CURRENT_MODEL.cacheSize
  ) {
    throw new Error(
      `--cache-offset は unknown または 0..${
        V8_CURRENT_MODEL.cacheSize - 1
      } の整数が必要です。`,
    );
  }
  return parsed;
};

/**
 * `--series` option を raw / converted に変換する。
 */
const parseSeriesOption = (
  value: string | undefined,
): ObservationSeriesKind => {
  if (value === undefined || value === "raw") {
    return "raw";
  }
  if (value === "converted") {
    return "converted";
  }
  throw new Error("--series は raw または converted が必要です。");
};

/**
 * CLI の簡易 usage を出力する。
 */
const printHelp = (io: CliIo) => {
  io.write("usage:");
  io.write("  npm run math-random:cli -- generate --seed 1337 --count 10");
  io.write(
    "  npm run math-random:cli -- generate --seed 1337 --count 10 --series converted --n 6",
  );
  io.write(
    '  npm run math-random:cli -- observe --values "0.1 0.2 0.3 0.4" --cache-offset unknown',
  );
  io.write(
    '  npm run math-random:cli -- observe --series converted --n 6 --values "5 2 4 4" --cache-offset 0',
  );
};

/**
 * seed から V8 current モデルの観測系列を生成して出力する。
 */
const runGenerate = (options: Record<string, string>, io: CliIo): number => {
  const seed = parseSeedOption(options.seed);
  const count = parsePositiveIntegerOption(options.count, "count", 10);
  const series = parseSeriesOption(options.series);
  const generator = createV8CurrentGeneratorFromSeed(seed);
  io.write(`model: ${V8_CURRENT_MODEL.id}`);
  io.write(`series: ${series}`);
  if (series === "converted") {
    const n = parsePositiveIntegerOption(options.n, "n", 0);
    if (n < 2) {
      throw new Error("--n は 2 以上の整数が必要です。");
    }
    for (let i = 0; i < count; i++) {
      io.write(floorRandom(generator.next(), n).toString());
    }
    return 0;
  }
  for (let i = 0; i < count; i++) {
    io.write(generator.next().toString());
  }
  return 0;
};

/**
 * 観測値から solver を実行し、候補数・理論値・次値予測を CLI 向けに出力する。
 */
const runObserve = async (
  options: Record<string, string>,
  io: CliIo,
): Promise<number> => {
  const valuesText = options.values;
  if (valuesText === undefined) {
    throw new Error("--values が必要です。");
  }
  const series = parseSeriesOption(options.series);
  const maxCandidates = parsePositiveIntegerOption(
    options["max-candidates"],
    "max-candidates",
    2,
  );
  const timeoutMs = parsePositiveIntegerOption(
    options.timeout,
    "timeout",
    10_000,
  );
  const cacheOffset = parseCacheOffsetOption(options["cache-offset"]);

  if (series === "converted") {
    const n = parsePositiveIntegerOption(options.n, "n", 0);
    if (n < 2) {
      throw new Error("--n は 2 以上の整数が必要です。");
    }
    const observations = parseConvertedObservations(valuesText, n);
    const progress = estimateConvertedObservationProgress(
      observations.length,
      n,
      V8_CURRENT_MODEL,
    );
    const result = await solveV8CurrentObservations(
      { kind: "converted", observations, n },
      { cacheOffset, maxCandidates, timeoutMs },
    );
    io.write(`model: ${V8_CURRENT_MODEL.id}`);
    io.write(`series: converted`);
    io.write(`n: ${n}`);
    io.write(`observations: ${observations.length}`);
    io.write(`cacheOffset: ${cacheOffset}`);
    io.write(`theoryRemainingBits: ${progress.remainingBits}`);
    io.write(`theoryCandidateCount: ${progress.estimatedCandidateCount}`);
    io.write(
      `theoryRemainingObservations: ${progress.estimatedRemainingRawObservations}`,
    );
    io.write(`status: ${result.status}`);
    io.write(`candidateCount: ${result.candidateCount}`);
    if (result.candidates.length === 1) {
      const candidate = result.candidates[0];
      if (candidate?.cacheOffset !== undefined) {
        io.write(`matchedCacheOffset: ${candidate.cacheOffset}`);
      }
    }
    if (result.nextPrediction !== undefined) {
      io.write(`next: ${result.nextPrediction}`);
    } else if (result.nextPredictions.length > 0) {
      io.write(`nextCandidates: ${result.nextPredictions.join(" ")}`);
    }
    if (result.reason !== undefined && result.reason.length > 0) {
      io.write(`reason: ${result.reason}`);
    }
    return 0;
  }

  const observations = parseRawObservations(valuesText);
  const progress = estimateRawObservationProgress(
    observations.length,
    V8_CURRENT_MODEL,
  );
  const result = await solveV8CurrentObservations(
    { kind: "raw", observations },
    { cacheOffset, maxCandidates, timeoutMs },
  );
  io.write(`model: ${V8_CURRENT_MODEL.id}`);
  io.write(`series: raw`);
  io.write(`observations: ${observations.length}`);
  io.write(`cacheOffset: ${cacheOffset}`);
  io.write(`theoryRemainingBits: ${progress.remainingBits}`);
  io.write(`theoryCandidateCount: ${progress.estimatedCandidateCount}`);
  io.write(
    `theoryRemainingRawObservations: ${progress.estimatedRemainingRawObservations}`,
  );
  io.write(`status: ${result.status}`);
  io.write(`candidateCount: ${result.candidateCount}`);
  if (result.candidates.length === 1) {
    const candidate = result.candidates[0];
    if (candidate?.cacheOffset !== undefined) {
      io.write(`matchedCacheOffset: ${candidate.cacheOffset}`);
    }
  }
  if (result.nextPrediction !== undefined) {
    io.write(`next: ${result.nextPrediction}`);
  } else if (result.nextPredictions.length > 0) {
    io.write(`nextCandidates: ${result.nextPredictions.join(" ")}`);
  }
  if (result.reason !== undefined && result.reason.length > 0) {
    io.write(`reason: ${result.reason}`);
  }
  return 0;
};

/**
 * `math-random-predictor` CLI の entry point。
 *
 * `generate` は観測値生成、`observe` / `predict` は観測系列に応じた推論を行う。
 */
export const runMathRandomCli = async (
  argv: readonly string[],
  io: CliIo = { write: console.log, writeError: console.error },
): Promise<number> => {
  try {
    const { command, options } = parseArgs(argv);
    if (command === "generate") {
      return runGenerate(options, io);
    }
    if (command === "observe" || command === "predict") {
      return runObserve(options, io);
    }
    printHelp(io);
    return command === undefined || command === "help" ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    (io.writeError ?? io.write)(`error: ${message}`);
    return 1;
  }
};
