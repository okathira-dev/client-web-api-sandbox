import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  countSolvedBoxes,
  deriveProblemBoxVisualState,
} from "../domain/stageRuntime";
import type { ProblemBoxId } from "../domain/stages";
import type { ProgressController } from "../hooks/useProgress";
import { type Locale, messages } from "../i18n";
import type { StageDefinition, StageServices } from "./types";

interface Props {
  definition: StageDefinition;
  locale: Locale;
  progress: ProgressController;
  services: StageServices;
  onBack(): void;
}

interface BoundaryProps {
  stageId: string;
  children: ReactNode;
}

const activeStageTitleId = "busybox-active-stage-title";

class StageErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      `Busybox stage ${this.props.stageId} failed`,
      error,
      info.componentStack,
    );
  }

  render() {
    return this.state.failed ? (
      <div className="stage-error" role="alert">
        This box stopped responding. Return to the box room and try again.
      </div>
    ) : (
      this.props.children
    );
  }
}

export function StageHost({
  definition,
  locale,
  progress,
  services,
  onBack,
}: Props) {
  const [signal, setSignal] = useState<AbortSignal | null>(null);
  const [solvedBeforeEntry] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        definition.summary.problems
          .map((problem) => problem.id)
          .filter((boxId) => progress.document.boxes[boxId] !== undefined),
      ),
  );
  const [solvedThisAttempt, setSolvedThisAttempt] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const copy = messages[locale];
  const capability = definition.probe();
  // The header is a lifetime record; only the boxes below reset for replay.
  // Keeping these signals separate avoids turning a closed replay box into a
  // misleading loss of previously earned progress.
  const persistentSolvedCount = countSolvedBoxes(
    definition.summary.problems.map((problem) => problem.id),
    progress.document.boxes,
  );
  const persistentlyComplete =
    persistentSolvedCount === definition.summary.problems.length;

  const problemState = useCallback(
    (boxId: string) =>
      deriveProblemBoxVisualState(
        solvedBeforeEntry.has(boxId),
        solvedThisAttempt.has(boxId),
      ),
    [solvedBeforeEntry, solvedThisAttempt],
  );

  const solve = useCallback(
    (boxId: string, facts: readonly string[] = []) => {
      // Attempt state is updated even when the grow-only document already has
      // this box and therefore returns no persistent change on a replay.
      setSolvedThisAttempt((current) => {
        if (current.has(boxId)) return current;
        return new Set([...current, boxId]);
      });
      progress.solve(boxId, facts);
    },
    [progress.solve],
  );

  const problemSolvers = useMemo(
    () =>
      new Map(
        definition.summary.problems.map((problemDefinition) => [
          problemDefinition.id,
          (facts: readonly string[] = []) => solve(problemDefinition.id, facts),
        ]),
      ),
    [definition.summary.problems, solve],
  );

  const problem = useCallback(
    (boxId: ProblemBoxId) => {
      const problemDefinition = definition.summary.problems.find(
        (candidate) => candidate.id === boxId,
      );
      if (!problemDefinition) {
        throw new Error(
          `Problem ${boxId} does not belong to stage ${definition.summary.id}`,
        );
      }
      const solveProblem = problemSolvers.get(boxId);
      if (!solveProblem) {
        throw new Error(`Missing solver for problem ${boxId}`);
      }
      return {
        definition: problemDefinition,
        state: problemState(boxId),
        solve: solveProblem,
      };
    },
    [definition.summary, problemSolvers, problemState],
  );

  useEffect(() => {
    const controller = new AbortController();
    setSignal(controller.signal);
    return () => controller.abort();
  }, []);

  return (
    <section className="stage-view" aria-labelledby={activeStageTitleId}>
      <button type="button" className="back-button" onClick={onBack}>
        ← {copy.back}
      </button>
      <header className="stage-view__header">
        <p>{definition.summary.id}</p>
        <h2 id={activeStageTitleId}>{definition.summary.label[locale]}</h2>
        <div
          className={`stage-state ${persistentlyComplete ? "stage-state--solved" : ""}`}
        >
          {persistentSolvedCount}/{definition.summary.problems.length}
        </div>
      </header>

      {capability === "unsupported" || capability === "unavailable" ? (
        <div className="capability-message" role="status">
          {copy.unavailable}
        </div>
      ) : signal ? (
        <StageErrorBoundary stageId={definition.summary.id}>
          <Suspense
            fallback={
              <div className="stage-loading">{copy.storageLoading}</div>
            }
          >
            <definition.component
              locale={locale}
              observations={progress.document.observations}
              signal={signal}
              problem={problem}
              problemState={problemState}
              services={services}
              solve={solve}
              observe={progress.observe}
            />
          </Suspense>
        </StageErrorBoundary>
      ) : null}
    </section>
  );
}
