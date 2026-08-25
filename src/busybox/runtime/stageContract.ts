import type SvgIcon from "@mui/material/SvgIcon";
import type { ComponentType } from "react";
import type {
  CapabilityState,
  ProblemBoxVisualState,
} from "../domain/stageRuntime";
import type { Locale } from "../i18n";

/** A stable identity used by routing, persistence, and the stage catalogue. */
export type StageIdFormat = `S-${number}`;

/** A box is identified locally inside its stage; persistence nests it by stage. */
export type LocalBoxIdFormat = `B${number}`;

export type LocalizedText = Readonly<{ ja: string; en: string }>;

/**
 * Baseline and browser permission are deliberately separate facts. The catalogue
 * derives its three visible groups from these two fields.
 */
export interface StagePlatform {
  readonly baseline: "widely" | "newly" | "limited";
  readonly permission: "none" | "required";
}

export type StageAccessKind =
  | "baseline-direct"
  | "baseline-permission"
  | "limited";

export function deriveStageAccessKind(
  platform: StagePlatform,
): StageAccessKind {
  if (platform.baseline === "limited") return "limited";
  return platform.permission === "required"
    ? "baseline-permission"
    : "baseline-direct";
}

export interface StageManifest<
  TStageId extends StageIdFormat = StageIdFormat,
  TBoxIds extends readonly LocalBoxIdFormat[] = readonly LocalBoxIdFormat[],
> {
  readonly id: TStageId;
  readonly name: LocalizedText;
  readonly platform: StagePlatform;
  readonly boxIds: TBoxIds;
  /** Named local IDs prevent repeating bare Bxx string literals in stage code. */
  readonly box: Readonly<{ [TBoxId in TBoxIds[number]]: TBoxId }>;
  /** This must remain a dynamic import. Never statically import a stage module. */
  readonly load: () => Promise<StageModule>;
}

interface StageManifestInput<
  TStageId extends StageIdFormat,
  TBoxIds extends readonly LocalBoxIdFormat[],
> {
  readonly id: TStageId;
  readonly name: LocalizedText;
  readonly platform: StagePlatform;
  readonly boxes: TBoxIds;
  readonly load: () => Promise<StageModule>;
}

export function defineStageManifest<
  const TStageId extends StageIdFormat,
  const TBoxIds extends readonly LocalBoxIdFormat[],
>(
  input: StageManifestInput<TStageId, TBoxIds>,
): StageManifest<TStageId, TBoxIds> {
  const box = Object.fromEntries(
    input.boxes.map((boxId) => [boxId, boxId]),
  ) as { [TBoxId in TBoxIds[number]]: TBoxId };
  return {
    id: input.id,
    name: input.name,
    platform: input.platform,
    boxIds: input.boxes,
    box,
    load: input.load,
  };
}

export type BoxTone = "violet" | "blue" | "cyan" | "green" | "amber" | "rose";

export interface StageBoxDefinition {
  readonly icon: typeof SvgIcon;
  /** Use a custom color only when color itself is part of the puzzle. */
  readonly tone?: BoxTone;
  readonly color?: string;
  readonly label: LocalizedText;
}

const boxToneColor: Readonly<Record<BoxTone, string>> = {
  violet: "#a78bfa",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  green: "#34d399",
  amber: "#fbbf24",
  rose: "#fb7185",
};

export function resolveStageBoxColor(definition: StageBoxDefinition): string {
  return definition.color ?? boxToneColor[definition.tone ?? "violet"];
}

export interface StageBoxHandle<TBoxId extends string = string> {
  readonly id: TBoxId;
  readonly definition: StageBoxDefinition;
  readonly state: ProblemBoxVisualState;
  solve(): void;
}

export interface StageProgressApi {
  hasMarker(marker: string): boolean;
  mark(marker: string): void;
}

export interface StageServices {
  drive?: {
    configured: boolean;
    sync(): Promise<DriveStageSyncResult>;
  };
}

export interface DriveStageSyncResult {
  synced: boolean;
  remoteDevice: boolean;
}

export interface StageComponentProps<TBoxId extends string = string> {
  locale: Locale;
  signal: AbortSignal;
  boxes: Readonly<Record<TBoxId, StageBoxHandle<TBoxId>>>;
  progress: StageProgressApi;
  services: StageServices;
}

export interface StageModule {
  readonly id: StageIdFormat;
  readonly boxes: Readonly<Record<string, StageBoxDefinition>>;
  readonly probe: () => CapabilityState;
  readonly Component: ComponentType<StageComponentProps>;
}

type ExactBoxDefinitions<TBoxIds extends readonly string[]> = {
  readonly [TBoxId in TBoxIds[number]]: StageBoxDefinition;
};

type NoExtraBoxDefinitions<
  TBoxIds extends readonly string[],
  TBoxes extends Record<string, StageBoxDefinition>,
> = Exclude<keyof TBoxes, TBoxIds[number]> extends never ? unknown : never;

/**
 * Keeps a stage's box visuals, capability probe and component together while
 * checking that it implements exactly the box IDs published by its manifest.
 */
export function defineStageModule<
  const TManifest extends StageManifest,
  const TBoxes extends ExactBoxDefinitions<TManifest["boxIds"]>,
>(
  manifest: TManifest,
  module: {
    readonly boxes: TBoxes & NoExtraBoxDefinitions<TManifest["boxIds"], TBoxes>;
    readonly probe?: () => CapabilityState;
    readonly Component: ComponentType<
      StageComponentProps<TManifest["boxIds"][number]>
    >;
  },
): StageModule {
  return {
    id: manifest.id,
    boxes: module.boxes,
    probe: module.probe ?? (() => "available"),
    Component: module.Component as ComponentType<StageComponentProps>,
  };
}
