import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  deriveProblemBoxVisualState,
  safeCapabilityProbe,
} from "../domain/stageRuntime";
import type { ProgressController } from "../hooks/useProgress";
import { type Locale, messages } from "../i18n";
import { uiText } from "../ui/locale";
import type {
  StageManifest,
  StageModule,
  StageServices,
} from "./stageContract";

interface Props {
  manifest: StageManifest;
  locale: Locale;
  progress: ProgressController;
  services: StageServices;
  onBack(): void;
}

interface BoundaryProps {
  stageId: string;
  locale: Locale;
  children: ReactNode;
}

const activeStageHeadingId = "busybox-active-stage-heading";
const modulePromises = new WeakMap<StageManifest, Promise<StageModule>>();

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
        {uiText(this.props.locale, "stageCrashed")}
      </div>
    ) : (
      this.props.children
    );
  }
}

function loadStageModule(
  manifest: StageManifest,
  forceReload = false,
): Promise<StageModule> {
  if (forceReload) modulePromises.delete(manifest);
  const existing = modulePromises.get(manifest);
  if (existing) return existing;
  const promise = manifest.load().then((module) => {
    const declared = new Set<string>(manifest.boxIds);
    const implemented = Object.keys(module.boxes);
    if (
      module.id !== manifest.id ||
      implemented.length !== declared.size ||
      implemented.some((boxId) => !declared.has(boxId))
    ) {
      throw new Error(`Invalid module contract for ${manifest.id}`);
    }
    return module;
  });
  modulePromises.set(manifest, promise);
  return promise;
}

function stageProgress(manifest: StageManifest, progress: ProgressController) {
  const solved = new Set(
    progress.document.stages[manifest.id]?.solvedBoxIds ?? [],
  );
  const solvedCount = manifest.boxIds.filter((boxId) =>
    solved.has(boxId),
  ).length;
  return { solved, solvedCount };
}

export function ManifestStageHost({
  manifest,
  locale,
  progress,
  services,
  onBack,
}: Props) {
  const [module, setModule] = useState<StageModule | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [signal, setSignal] = useState<AbortSignal | null>(null);
  const { solved, solvedCount } = stageProgress(manifest, progress);
  const [solvedBeforeEntry] = useState(() => new Set(solved));
  const [solvedThisAttempt, setSolvedThisAttempt] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const persistSolveRef = useRef(progress.solve);
  const persistMarkRef = useRef(progress.mark);
  persistSolveRef.current = progress.solve;
  persistMarkRef.current = progress.mark;
  const copy = messages[locale];

  useEffect(() => {
    let active = true;
    setModule(null);
    setLoadError(false);
    void loadStageModule(manifest, attempt > 0)
      .then((loaded) => {
        if (active) setModule(loaded);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt, manifest]);

  useEffect(() => {
    const controller = new AbortController();
    setSignal(controller.signal);
    return () => controller.abort();
  }, []);

  const solve = useCallback(
    (boxId: string) => {
      setSolvedThisAttempt((current) =>
        current.has(boxId) ? current : new Set([...current, boxId]),
      );
      persistSolveRef.current(manifest.id, boxId);
    },
    [manifest.id],
  );
  const solvers = useMemo(
    () =>
      Object.fromEntries(
        manifest.boxIds.map((boxId) => [boxId, () => solve(boxId)]),
      ),
    [manifest.boxIds, solve],
  );
  const boxes = useMemo(() => {
    if (!module) return {};
    return Object.fromEntries(
      manifest.boxIds.map((boxId) => {
        const definition = module.boxes[boxId];
        const solve = solvers[boxId];
        if (!definition || !solve) {
          throw new Error(`Missing runtime box ${manifest.id}/${boxId}`);
        }
        return [
          boxId,
          {
            id: boxId,
            definition,
            state: deriveProblemBoxVisualState(
              solvedBeforeEntry.has(boxId),
              solvedThisAttempt.has(boxId),
            ),
            solve,
          },
        ];
      }),
    );
  }, [
    manifest.boxIds,
    manifest.id,
    module,
    solvedBeforeEntry,
    solvedThisAttempt,
    solvers,
  ]);
  const stageProgressApi = useMemo(
    () => ({
      hasMarker: (marker: string) =>
        progress.document.stages[manifest.id]?.markers?.includes(marker) ??
        false,
      mark: (marker: string) => persistMarkRef.current(manifest.id, marker),
    }),
    [manifest.id, progress.document.stages],
  );
  const capability = module ? safeCapabilityProbe(module.probe) : "unknown";
  const persistentlyComplete = solvedCount === manifest.boxIds.length;

  return (
    <section className="stage-view" aria-labelledby={activeStageHeadingId}>
      <button type="button" className="back-button" onClick={onBack}>
        ← {copy.back}
      </button>
      <header className="stage-view__header">
        <p>{manifest.id}</p>
        <h2 id={activeStageHeadingId}>{manifest.name[locale]}</h2>
        <div
          className={`stage-state ${persistentlyComplete ? "stage-state--solved" : ""}`}
        >
          {solvedCount}/{manifest.boxIds.length}
        </div>
      </header>

      {loadError ? (
        <div className="stage-error" role="alert">
          {uiText(locale, "stageCrashed")}
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            {uiText(locale, "stageRetry")}
          </button>
        </div>
      ) : !module || !signal ? (
        <div className="stage-loading">{uiText(locale, "stageLoading")}</div>
      ) : capability === "unsupported" || capability === "unavailable" ? (
        <div className="capability-message" role="status">
          {copy.unavailable}
        </div>
      ) : (
        <StageErrorBoundary stageId={manifest.id} locale={locale}>
          <module.Component
            locale={locale}
            signal={signal}
            boxes={boxes}
            progress={stageProgressApi}
            services={services}
          />
        </StageErrorBoundary>
      )}
    </section>
  );
}
