import type { Locale } from "../i18n";

/** This is a clean pre-release schema. Older development saves are discarded. */
export const progressSchemaVersion = 1 as const;

export interface StageProgress {
  solvedBoxIds: string[];
  markers?: string[];
}

export interface ProgressSettings {
  locale: Locale;
}

export interface ProgressDocument {
  schemaVersion: typeof progressSchemaVersion;
  installationId: string;
  stages: Record<string, StageProgress>;
  settings: ProgressSettings;
}

export type ProgressParseResult =
  | { status: "valid"; document: ProgressDocument }
  | { status: "corrupt"; reason: string }
  | { status: "future"; version: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

function uniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function parseStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return null;
  }
  return uniqueStrings(value);
}

function parseStageProgress(value: unknown): StageProgress | null {
  if (!isRecord(value)) return null;
  const solvedBoxIds = parseStringArray(value.solvedBoxIds);
  if (!solvedBoxIds) return null;
  const markers =
    value.markers === undefined ? undefined : parseStringArray(value.markers);
  if (markers === null) return null;
  return markers && markers.length > 0
    ? { solvedBoxIds, markers }
    : { solvedBoxIds };
}

function makeInstallationId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function createProgressDocument(
  locale: Locale,
  installationId = makeInstallationId(),
): ProgressDocument {
  return {
    schemaVersion: progressSchemaVersion,
    installationId,
    stages: {},
    settings: { locale },
  };
}

export function parseProgressDocument(value: unknown): ProgressParseResult {
  if (!isRecord(value) || typeof value.schemaVersion !== "number") {
    return { status: "corrupt", reason: "not-a-progress-document" };
  }
  if (value.schemaVersion > progressSchemaVersion) {
    return { status: "future", version: value.schemaVersion };
  }
  if (value.schemaVersion !== progressSchemaVersion) {
    return { status: "corrupt", reason: "unsupported-schema" };
  }
  if (
    typeof value.installationId !== "string" ||
    !isRecord(value.stages) ||
    !isRecord(value.settings) ||
    !isLocale(value.settings.locale)
  ) {
    return { status: "corrupt", reason: "required-fields" };
  }

  const stages: Record<string, StageProgress> = {};
  for (const [stageId, rawStage] of Object.entries(value.stages)) {
    const stage = parseStageProgress(rawStage);
    if (!stage) return { status: "corrupt", reason: `stage:${stageId}` };
    stages[stageId] = stage;
  }
  return {
    status: "valid",
    document: {
      schemaVersion: progressSchemaVersion,
      installationId: value.installationId,
      stages,
      settings: { locale: value.settings.locale },
    },
  };
}

function mergeStageProgress(
  left: StageProgress | undefined,
  right: StageProgress | undefined,
): StageProgress | undefined {
  if (!left) return right;
  if (!right) return left;
  const solvedBoxIds = uniqueStrings([
    ...left.solvedBoxIds,
    ...right.solvedBoxIds,
  ]);
  const markers = uniqueStrings([
    ...(left.markers ?? []),
    ...(right.markers ?? []),
  ]);
  return markers.length > 0 ? { solvedBoxIds, markers } : { solvedBoxIds };
}

/** Stage and box IDs are grow-only sets, so merging never loses a clear. */
export function mergeProgressDocuments(
  local: ProgressDocument,
  remote: ProgressDocument,
): ProgressDocument {
  const stageIds = new Set([
    ...Object.keys(local.stages),
    ...Object.keys(remote.stages),
  ]);
  const stages: Record<string, StageProgress> = {};
  for (const stageId of stageIds) {
    const progress = mergeStageProgress(
      local.stages[stageId],
      remote.stages[stageId],
    );
    if (progress) stages[stageId] = progress;
  }
  return {
    schemaVersion: progressSchemaVersion,
    installationId: local.installationId,
    stages,
    // Settings are device-local even when the progress document is synchronized.
    settings: local.settings,
  };
}

export function isBoxSolved(
  document: ProgressDocument,
  stageId: string,
  boxId: string,
): boolean {
  return document.stages[stageId]?.solvedBoxIds.includes(boxId) ?? false;
}

export function solveBox(
  document: ProgressDocument,
  stageId: string,
  boxId: string,
): ProgressDocument {
  const current = document.stages[stageId];
  if (current?.solvedBoxIds.includes(boxId)) return document;
  return {
    ...document,
    stages: {
      ...document.stages,
      [stageId]: {
        solvedBoxIds: uniqueStrings([...(current?.solvedBoxIds ?? []), boxId]),
        ...(current?.markers?.length ? { markers: current.markers } : {}),
      },
    },
  };
}

export function hasStageMarker(
  document: ProgressDocument,
  stageId: string,
  marker: string,
): boolean {
  return document.stages[stageId]?.markers?.includes(marker) ?? false;
}

export function markStage(
  document: ProgressDocument,
  stageId: string,
  marker: string,
): ProgressDocument {
  const current = document.stages[stageId];
  if (current?.markers?.includes(marker)) return document;
  return {
    ...document,
    stages: {
      ...document.stages,
      [stageId]: {
        solvedBoxIds: current?.solvedBoxIds ?? [],
        markers: uniqueStrings([...(current?.markers ?? []), marker]),
      },
    },
  };
}
