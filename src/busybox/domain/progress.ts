import type { Locale } from "../i18n";

export const progressSchemaVersion = 1 as const;

export interface BoxProgress {
  [key: string]: unknown;
  solvedAt: string;
  facts: string[];
}

export interface ProgressSettings {
  [key: string]: unknown;
  locale: Locale;
}

export interface ObservationProgress {
  [key: string]: unknown;
  observedAt: string;
  facts: string[];
}

export interface ProgressDocument {
  [key: string]: unknown;
  schemaVersion: typeof progressSchemaVersion;
  installationId: string;
  createdAt: string;
  updatedAt: string;
  boxes: Record<string, BoxProgress>;
  observations: Record<string, ObservationProgress>;
  settings: ProgressSettings;
}

export type ProgressParseResult =
  | { status: "valid"; document: ProgressDocument; migrated: boolean }
  | { status: "corrupt"; reason: string }
  | { status: "future"; version: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocale(value: unknown): value is Locale {
  return value === "ja" || value === "en";
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
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
  now = new Date().toISOString(),
  installationId = makeInstallationId(),
): ProgressDocument {
  return {
    schemaVersion: progressSchemaVersion,
    installationId,
    createdAt: now,
    updatedAt: now,
    boxes: {},
    observations: {},
    settings: { locale },
  };
}

function parseBox(value: unknown): BoxProgress | null {
  if (
    !isRecord(value) ||
    !isIsoDate(value.solvedAt) ||
    !Array.isArray(value.facts)
  ) {
    return null;
  }
  const facts = value.facts.filter(
    (fact): fact is string => typeof fact === "string",
  );
  if (facts.length !== value.facts.length) return null;

  // Unknown fields survive a read/write cycle so an older client does not erase
  // observations added by a newer client using the same schema version.
  return { ...value, solvedAt: value.solvedAt, facts };
}

function parseObservation(value: unknown): ObservationProgress | null {
  if (
    !isRecord(value) ||
    !isIsoDate(value.observedAt) ||
    !Array.isArray(value.facts)
  ) {
    return null;
  }
  const facts = value.facts.filter(
    (fact): fact is string => typeof fact === "string",
  );
  if (facts.length !== value.facts.length) return null;
  return { ...value, observedAt: value.observedAt, facts };
}

function parseVersionOne(value: Record<string, unknown>): ProgressParseResult {
  if (
    typeof value.installationId !== "string" ||
    !isIsoDate(value.createdAt) ||
    !isIsoDate(value.updatedAt) ||
    !isRecord(value.boxes) ||
    !isRecord(value.settings) ||
    !isLocale(value.settings.locale)
  ) {
    return { status: "corrupt", reason: "required-fields" };
  }

  const boxes: Record<string, BoxProgress> = {};
  for (const [boxId, rawBox] of Object.entries(value.boxes)) {
    const box = parseBox(rawBox);
    if (!box) return { status: "corrupt", reason: `box:${boxId}` };
    boxes[boxId] = box;
  }

  const observations: Record<string, ObservationProgress> = {};
  const rawObservations = value.observations ?? {};
  if (!isRecord(rawObservations)) {
    return { status: "corrupt", reason: "observations" };
  }
  for (const [observationId, rawObservation] of Object.entries(
    rawObservations,
  )) {
    const observation = parseObservation(rawObservation);
    if (!observation) {
      return { status: "corrupt", reason: `observation:${observationId}` };
    }
    observations[observationId] = observation;
  }

  return {
    status: "valid",
    migrated: false,
    document: {
      ...value,
      schemaVersion: progressSchemaVersion,
      installationId: value.installationId,
      createdAt: value.createdAt,
      updatedAt: value.updatedAt,
      boxes,
      observations,
      settings: { ...value.settings, locale: value.settings.locale },
    },
  };
}

function migrateVersionZero(
  value: Record<string, unknown>,
): ProgressParseResult {
  if (
    typeof value.installationId !== "string" ||
    !isIsoDate(value.createdAt) ||
    !Array.isArray(value.solvedBoxes)
  ) {
    return { status: "corrupt", reason: "legacy-fields" };
  }

  const solvedBoxes = value.solvedBoxes.filter(
    (boxId): boxId is string => typeof boxId === "string",
  );
  if (solvedBoxes.length !== value.solvedBoxes.length) {
    return { status: "corrupt", reason: "legacy-boxes" };
  }

  const locale = isLocale(value.locale) ? value.locale : "en";
  const createdAt = value.createdAt;
  const boxes = Object.fromEntries(
    solvedBoxes.map((boxId) => [boxId, { solvedAt: createdAt, facts: [] }]),
  );

  return {
    status: "valid",
    migrated: true,
    document: {
      schemaVersion: progressSchemaVersion,
      installationId: value.installationId,
      createdAt,
      updatedAt: createdAt,
      boxes,
      observations: {},
      settings: { locale },
    },
  };
}

export function parseProgressDocument(value: unknown): ProgressParseResult {
  if (!isRecord(value) || typeof value.schemaVersion !== "number") {
    return { status: "corrupt", reason: "not-a-progress-document" };
  }
  if (value.schemaVersion > progressSchemaVersion) {
    return { status: "future", version: value.schemaVersion };
  }
  if (value.schemaVersion === 0) return migrateVersionZero(value);
  if (value.schemaVersion === progressSchemaVersion)
    return parseVersionOne(value);
  return { status: "corrupt", reason: "unsupported-schema" };
}

function earlierIsoDate(left: string, right: string): string {
  return Date.parse(left) <= Date.parse(right) ? left : right;
}

function laterIsoDate(left: string, right: string): string {
  return Date.parse(left) >= Date.parse(right) ? left : right;
}

export function mergeProgressDocuments(
  local: ProgressDocument,
  remote: ProgressDocument,
  now = new Date().toISOString(),
): ProgressDocument {
  const boxes: Record<string, BoxProgress> = { ...local.boxes };
  for (const [boxId, remoteBox] of Object.entries(remote.boxes)) {
    const localBox = boxes[boxId];
    boxes[boxId] = localBox
      ? {
          ...remoteBox,
          ...localBox,
          solvedAt: earlierIsoDate(localBox.solvedAt, remoteBox.solvedAt),
          facts: [...new Set([...localBox.facts, ...remoteBox.facts])].sort(),
        }
      : remoteBox;
  }

  const observations: Record<string, ObservationProgress> = {
    ...local.observations,
  };
  for (const [observationId, remoteObservation] of Object.entries(
    remote.observations,
  )) {
    const localObservation = observations[observationId];
    observations[observationId] = localObservation
      ? {
          ...remoteObservation,
          ...localObservation,
          observedAt: earlierIsoDate(
            localObservation.observedAt,
            remoteObservation.observedAt,
          ),
          facts: [
            ...new Set([...localObservation.facts, ...remoteObservation.facts]),
          ].sort(),
        }
      : remoteObservation;
  }

  // Cleared boxes are a grow-only set. Device-local settings stay local; a Drive
  // restore must never silently change the language chosen on this device.
  return {
    ...remote,
    ...local,
    schemaVersion: progressSchemaVersion,
    createdAt: earlierIsoDate(local.createdAt, remote.createdAt),
    updatedAt: laterIsoDate(
      now,
      laterIsoDate(local.updatedAt, remote.updatedAt),
    ),
    boxes,
    observations,
    settings: local.settings,
  };
}

export function recordObservation(
  document: ProgressDocument,
  observationId: string,
  facts: readonly string[] = [],
  now = new Date().toISOString(),
): ProgressDocument {
  const current = document.observations[observationId];
  if (current) {
    const mergedFacts = [...new Set([...current.facts, ...facts])].sort();
    if (mergedFacts.length === current.facts.length) return document;
    return {
      ...document,
      updatedAt: now,
      observations: {
        ...document.observations,
        [observationId]: { ...current, facts: mergedFacts },
      },
    };
  }
  return {
    ...document,
    updatedAt: now,
    observations: {
      ...document.observations,
      [observationId]: { observedAt: now, facts: [...new Set(facts)].sort() },
    },
  };
}

export function solveBox(
  document: ProgressDocument,
  boxId: string,
  facts: readonly string[] = [],
  now = new Date().toISOString(),
): ProgressDocument {
  const current = document.boxes[boxId];
  if (current) {
    const mergedFacts = [...new Set([...current.facts, ...facts])].sort();
    if (mergedFacts.length === current.facts.length) return document;
    return {
      ...document,
      updatedAt: now,
      boxes: { ...document.boxes, [boxId]: { ...current, facts: mergedFacts } },
    };
  }
  return {
    ...document,
    updatedAt: now,
    boxes: {
      ...document.boxes,
      [boxId]: { solvedAt: now, facts: [...new Set(facts)].sort() },
    },
  };
}
