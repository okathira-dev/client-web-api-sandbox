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
  services: StageServices;
  observe(observationId: string, facts?: readonly string[]): void;
}

/**
 * Entry-scoped view of one static problem definition and its replay state.
 * `solve` is stable across state changes so stage effects can depend on it.
 */
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

export interface StageRegistration {
  stage: StageSpec;
  probe(): CapabilityState;
  component: LazyExoticComponent<StageComponent>;
}

export interface StageRuntimeProgress {
  document: ProgressDocument;
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
}
