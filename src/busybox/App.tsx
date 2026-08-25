import { useEffect, useState } from "react";
import { countSolvedBoxes } from "./domain/stageRuntime";
import { useDriveBackup } from "./hooks/useDriveBackup";
import { useProgress } from "./hooks/useProgress";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { detectLocale, messages, productCopy } from "./i18n";
import { ManifestStageHost } from "./runtime/ManifestStageHost";
import { stageIndex } from "./runtime/stage-index.generated";
import { uiText } from "./ui/locale";
import { StageCatalogue } from "./ui/StageCatalogue";

type View = "stages" | "settings" | "about";
type StageId = (typeof stageIndex)[number]["id"];
const totalBoxCount = stageIndex.reduce(
  (total, stage) => total + stage.boxIds.length,
  0,
);

const headingIds = {
  stages: "busybox-stages-heading",
  settings: "busybox-settings-heading",
  about: "busybox-about-heading",
} as const;

function isStageId(value: string): value is StageId {
  return stageIndex.some((stage) => stage.id === value);
}

function stageIdFromUrl(): StageId | null {
  const stageId = new URL(window.location.href).searchParams.get("stage");
  return stageId && isStageId(stageId) ? stageId : null;
}

export function App() {
  const progress = useProgress(detectLocale());
  const serviceWorker = useServiceWorker();
  const drive = useDriveBackup(progress);
  const locale = progress.document.settings.locale;
  const [view, setView] = useState<View>("stages");
  const [selectedStageId, setSelectedStageId] = useState(stageIdFromUrl);
  const [stageAttemptId, setStageAttemptId] = useState(0);
  const copy = messages[locale];
  const solvedCount = stageIndex.reduce((total, stage) => {
    const solvedBoxIds = new Set(
      progress.document.stages[stage.id]?.solvedBoxIds ?? [],
    );
    return total + countSolvedBoxes(stage.boxIds, solvedBoxIds);
  }, 0);
  const storageMessage = {
    loading: copy.storageLoading,
    ready: copy.storageReady,
    unavailable: copy.storageUnavailable,
    corrupt: copy.storageCorrupt,
    future: copy.storageFuture,
  }[progress.storageState];
  const serviceWorkerMessage = {
    unsupported: copy.pwaUnsupported,
    development: copy.pwaDevelopment,
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
  const driveFailureMessage =
    drive.failure?.code === "corrupt"
      ? copy.driveFailureCorrupt
      : drive.failure?.code === "future"
        ? copy.driveFailureFuture
        : drive.failure?.code === "conflict"
          ? copy.driveFailureConflict
          : copy.driveFailureUnknown;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const syncRoute = () => {
      setSelectedStageId(stageIdFromUrl());
      setStageAttemptId((current) => current + 1);
      setView("stages");
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const openStage = (stageId: StageId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", stageId);
    window.history.pushState({}, "", url);
    setSelectedStageId(stageId);
    setStageAttemptId((current) => current + 1);
  };

  const showStageList = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("stage");
    window.history.pushState({}, "", url);
    setSelectedStageId(null);
  };

  const selectedManifest = selectedStageId
    ? stageIndex.find((stage) => stage.id === selectedStageId)
    : undefined;

  return (
    <div className="app-shell">
      <header className="hero">
        <a className="eyebrow" href="../index.html">
          {productCopy.descriptor}
        </a>
        <h1>{productCopy.brandName}</h1>
        <p className="hero__tagline">{copy.tagline}</p>
        <p className="hero__subtitle">{copy.subtitle}</p>
      </header>

      <nav className="nav" aria-label={uiText(locale, "primaryNav")}>
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
        selectedManifest &&
        progress.storageState !== "loading" ? (
          <ManifestStageHost
            key={`${selectedManifest.id}:${stageAttemptId}`}
            manifest={selectedManifest}
            locale={locale}
            progress={progress}
            services={{
              drive: { configured: drive.configured, sync: drive.sync },
            }}
            onBack={showStageList}
          />
        ) : view === "stages" ? (
          <StageCatalogue
            headingId={headingIds.stages}
            heading={copy.stages}
            progressLabel={copy.progress}
            solvedCount={solvedCount}
            totalBoxCount={totalBoxCount}
            locale={locale}
            stages={stageIndex}
            progressStages={progress.document.stages}
            onOpen={openStage}
          />
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
            <h3>{copy.drive}</h3>
            <button
              type="button"
              className="drive-action"
              disabled={
                drive.state === "unconfigured" ||
                drive.state === "authorizing" ||
                drive.state === "syncing"
              }
              onClick={() => void drive.sync()}
            >
              {
                {
                  unconfigured: copy.driveUnconfigured,
                  idle: copy.driveIdle,
                  authorizing: copy.driveAuthorizing,
                  syncing: copy.driveSyncing,
                  success: copy.driveSuccess,
                  deleted: copy.driveDeleted,
                  error: copy.driveError,
                }[drive.state]
              }
            </button>
            <p className="privacy-note">{copy.driveMergeNotice}</p>
            {drive.failure && (
              <div className="drive-recovery" role="alert">
                <p>{driveFailureMessage}</p>
                <div className="drive-secondary-actions">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => void drive.sync()}
                  >
                    {copy.driveRetry}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={drive.dismissFailure}
                  >
                    {copy.driveContinueLocal}
                  </button>
                </div>
                {drive.failure.replicas.map((replica) => (
                  <div className="drive-recovery__replica" key={replica.id}>
                    <code>{replica.name}</code>
                    <div className="drive-secondary-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => void drive.exportFailedReplica(replica)}
                      >
                        {copy.driveExportReplica}
                      </button>
                      <button
                        type="button"
                        className="text-button danger-text"
                        onClick={() => {
                          if (window.confirm(copy.driveRemoveReplicaConfirm)) {
                            void drive.removeFailedReplica(replica);
                          }
                        }}
                      >
                        {copy.driveRemoveReplica}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {drive.connected && (
              <div className="drive-secondary-actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => void drive.disconnect()}
                >
                  {copy.driveDisconnect}
                </button>
                <button
                  type="button"
                  className="text-button danger-text"
                  onClick={() => {
                    if (window.confirm(copy.driveDeleteConfirm)) {
                      void drive.removeRemote();
                    }
                  }}
                >
                  {copy.driveDelete}
                </button>
              </div>
            )}
            <p className="privacy-note">{copy.privacy}</p>
          </section>
        )}

        {view === "about" && (
          <section className="panel" aria-labelledby={headingIds.about}>
            <h2 id={headingIds.about}>{copy.about}</h2>
            <p>{copy.aboutBody}</p>
            <div className="about-links">
              <a href="./docs/privacy-and-permissions.md">
                {uiText(locale, "privacyPermissions")}
              </a>
              <a href={`./licenses/index.html?locale=${locale}`}>
                {copy.thirdPartyLicenses}
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
