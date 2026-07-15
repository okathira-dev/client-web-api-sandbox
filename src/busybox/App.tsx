import { useEffect, useState } from "react";
import { deriveStageProgress } from "./domain/stageRuntime";
import { stageCatalogue, totalBoxCount } from "./domain/stages";
import { type ProgressController, useProgress } from "./hooks/useProgress";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { detectLocale, messages } from "./i18n";
import { StageHost } from "./runtime/StageHost";
import { stageDefinitions } from "./runtime/stageDefinitions";

type View = "stages" | "settings" | "about";

const headingIds = {
  stages: "busybox-stages-heading",
  settings: "busybox-settings-heading",
  about: "busybox-about-heading",
} as const;

function stageIdFromUrl(): string | null {
  const stageId = new URL(window.location.href).searchParams.get("stage");
  return stageId && stageDefinitions[stageId] ? stageId : null;
}

export function App() {
  const progress = useProgress(detectLocale());
  const serviceWorker = useServiceWorker();
  const locale = progress.document.settings.locale;
  const [view, setView] = useState<View>("stages");
  const [selectedStageId, setSelectedStageId] = useState(stageIdFromUrl);
  const copy = messages[locale];
  const solvedCount = Object.keys(progress.document.boxes).length;
  const storageMessage = {
    loading: copy.storageLoading,
    ready: copy.storageReady,
    unavailable: copy.storageUnavailable,
    corrupt: copy.storageCorrupt,
    future: copy.storageFuture,
  }[progress.storageState];
  const serviceWorkerMessage = {
    unsupported: copy.pwaUnsupported,
    registering: copy.pwaRegistering,
    ready: copy.pwaReady,
    "update-ready": copy.pwaUpdate,
    error: copy.pwaError,
  }[serviceWorker.state];

  const exportProgress = () => {
    const blob = new Blob([JSON.stringify(progress.document, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `busybox-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetProgress = () => {
    if (window.confirm(copy.resetConfirm)) void progress.reset();
  };

  useEffect(() => {
    const syncRoute = () => {
      setSelectedStageId(stageIdFromUrl());
      setView("stages");
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const openStage = (stageId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", stageId);
    window.history.pushState({}, "", url);
    setSelectedStageId(stageId);
  };

  const showStageList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("stage");
    window.history.pushState({}, "", url);
    setSelectedStageId(null);
  };

  const selectedDefinition = selectedStageId
    ? stageDefinitions[selectedStageId]
    : undefined;

  return (
    <div className="app-shell">
      <header className="hero">
        <a className="eyebrow" href="../index.html">
          Web API Explorer
        </a>
        <h1>Busybox</h1>
        <p className="hero__tagline">{copy.tagline}</p>
        <p className="hero__subtitle">{copy.subtitle}</p>
      </header>

      <nav className="nav" aria-label="Primary">
        <button
          type="button"
          aria-current={view === "stages" ? "page" : undefined}
          onClick={() => setView("stages")}
        >
          {copy.stages}
        </button>
        <button
          type="button"
          aria-current={view === "settings" ? "page" : undefined}
          onClick={() => setView("settings")}
        >
          {copy.settings}
        </button>
        <button
          type="button"
          aria-current={view === "about" ? "page" : undefined}
          onClick={() => setView("about")}
        >
          {copy.about}
        </button>
      </nav>

      <main className="content">
        {view === "stages" &&
        selectedDefinition &&
        progress.storageState !== "loading" ? (
          <StageHost
            definition={selectedDefinition}
            locale={locale}
            progress={progress}
            onBack={showStageList}
          />
        ) : view === "stages" ? (
          <section aria-labelledby={headingIds.stages}>
            <div className="section-heading">
              <h2 id={headingIds.stages}>{copy.stages}</h2>
              <p>
                {copy.progress}: {solvedCount} / {totalBoxCount}
              </p>
            </div>
            <ol className="stage-grid">
              {stageCatalogue.map((stage) => (
                <li key={stage.id}>
                  <StageCard
                    stage={stage}
                    locale={locale}
                    boxes={progress.document.boxes}
                    onOpen={openStage}
                  />
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {view === "settings" && (
          <section className="panel" aria-labelledby={headingIds.settings}>
            <h2 id={headingIds.settings}>{copy.settings}</h2>
            <fieldset>
              <legend>{copy.language}</legend>
              <label>
                <input
                  type="radio"
                  name="locale"
                  checked={locale === "ja"}
                  onChange={() => progress.setLocale("ja")}
                />{" "}
                {copy.japanese}
              </label>
              <label>
                <input
                  type="radio"
                  name="locale"
                  checked={locale === "en"}
                  onChange={() => progress.setLocale("en")}
                />{" "}
                {copy.english}
              </label>
            </fieldset>
            <div
              className={`storage-status storage-status--${progress.storageState}`}
              role="status"
            >
              {storageMessage}
            </div>
            <div className="settings-actions">
              <button type="button" onClick={exportProgress}>
                {copy.exportProgress}
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={resetProgress}
              >
                {copy.resetProgress}
              </button>
            </div>
            <h3>{copy.pwa}</h3>
            <button
              type="button"
              className="pwa-status"
              disabled={serviceWorker.state !== "update-ready"}
              onClick={serviceWorker.applyUpdate}
            >
              {serviceWorkerMessage}
            </button>
            <p className="privacy-note">{copy.privacy}</p>
          </section>
        )}

        {view === "about" && (
          <section className="panel" aria-labelledby={headingIds.about}>
            <h2 id={headingIds.about}>{copy.about}</h2>
            <p>{copy.aboutBody}</p>
            <a href="./docs/privacy-and-permissions.md">
              Privacy &amp; permissions
            </a>
          </section>
        )}
      </main>
    </div>
  );
}

interface StageCardProps {
  stage: (typeof stageCatalogue)[number];
  locale: "ja" | "en";
  boxes: ProgressController["document"]["boxes"];
  onOpen(stageId: string): void;
}

function StageCard({ stage, locale, boxes, onOpen }: StageCardProps) {
  const copy = messages[locale];
  const definition = stageDefinitions[stage.id];
  const state = deriveStageProgress(stage.boxIds, boxes);
  const status =
    state === "solved"
      ? copy.solved
      : state === "partial"
        ? copy.partial
        : definition
          ? copy.available
          : copy.planned;

  return (
    <article
      className={`stage-card stage-card--${stage.category} stage-card--${state}`}
    >
      <div className="gift-box" aria-hidden="true">
        <span className="gift-box__ribbon" />
      </div>
      <div>
        <p className="stage-card__id">{stage.id}</p>
        <h3>{stage.name[locale]}</h3>
        <p>
          {stage.boxCount} {copy.boxes} · {status}
        </p>
      </div>
      <button
        type="button"
        disabled={!definition}
        onClick={() => onOpen(stage.id)}
      >
        {copy.start}
      </button>
    </article>
  );
}
