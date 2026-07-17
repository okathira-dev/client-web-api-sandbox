import type { LazyExoticComponent } from "react";
import type { ObservationProgress, ProgressDocument } from "../domain/progress";
import type {
  CapabilityState,
  ProblemBoxVisualState,
} from "../domain/stageRuntime";
import type { ProblemBoxId, ProblemSpec, StageSpec } from "../domain/stages";
import type { Locale } from "../i18n";

export interface StageComponentProps {
  locale: Locale;
  observations: Readonly<Record<string, ObservationProgress>>;
  signal: AbortSignal;
  problem(boxId: ProblemBoxId): ProblemHandle;
  /** @deprecated Use problem(boxId).state while grouped stage modules migrate. */
  problemState(boxId: string): ProblemBoxVisualState;
  services: StageServices;
  /** @deprecated Use problem(boxId).solve() while grouped stage modules migrate. */
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
}

export interface ProblemHandle {
  readonly definition: ProblemSpec;
  readonly state: ProblemBoxVisualState;
  solve(facts?: readonly string[]): void;
}

export interface DriveStageSyncResult {
  synced: boolean;
  remoteDevice: boolean;
}

export interface StageServices {
  drive?: {
    configured: boolean;
    sync(): Promise<DriveStageSyncResult>;
  };
}

export type StageComponent = (props: StageComponentProps) => React.JSX.Element;

export interface StageDefinition {
  summary: StageSpec;
  probe(): CapabilityState;
  component: LazyExoticComponent<StageComponent>;
}

export interface StageRuntimeProgress {
  document: ProgressDocument;
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
}
