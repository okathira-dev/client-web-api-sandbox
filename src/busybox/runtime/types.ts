import type { LazyExoticComponent } from "react";
import type {
  BoxProgress,
  ObservationProgress,
  ProgressDocument,
} from "../domain/progress";
import type { CapabilityState } from "../domain/stageRuntime";
import type { StageSummary } from "../domain/stages";
import type { Locale } from "../i18n";

export interface StageComponentProps {
  locale: Locale;
  boxes: Readonly<Record<string, BoxProgress>>;
  observations: Readonly<Record<string, ObservationProgress>>;
  signal: AbortSignal;
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
}

export type StageComponent = (props: StageComponentProps) => React.JSX.Element;

export interface StageDefinition {
  summary: StageSummary;
  probe(): CapabilityState;
  component: LazyExoticComponent<StageComponent>;
}

export interface StageRuntimeProgress {
  document: ProgressDocument;
  solve(boxId: string, facts?: readonly string[]): void;
  observe(observationId: string, facts?: readonly string[]): void;
}
