import {
  Component,
  type ErrorInfo,
  type ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { deriveStageProgress } from "../domain/stageRuntime";
import type { ProgressController } from "../hooks/useProgress";
import { type Locale, messages } from "../i18n";
import type { StageDefinition } from "./types";

interface Props {
  definition: StageDefinition;
  locale: Locale;
  progress: ProgressController;
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

export function StageHost({ definition, locale, progress, onBack }: Props) {
  const [signal, setSignal] = useState<AbortSignal | null>(null);
  const copy = messages[locale];
  const capability = definition.probe();
  const stageState = deriveStageProgress(
    definition.summary.boxIds,
    progress.document.boxes,
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
        <h2 id={activeStageTitleId}>{definition.summary.name[locale]}</h2>
        <div className={`stage-state stage-state--${stageState}`}>
          {stageState === "solved"
            ? "✓"
            : `${Object.keys(progress.document.boxes).filter((id) => definition.summary.boxIds.includes(id)).length}/${definition.summary.boxCount}`}
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
              boxes={progress.document.boxes}
              observations={progress.document.observations}
              signal={signal}
              solve={progress.solve}
              observe={progress.observe}
            />
          </Suspense>
        </StageErrorBoundary>
      ) : null}
    </section>
  );
}
