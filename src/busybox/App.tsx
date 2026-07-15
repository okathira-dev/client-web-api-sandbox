import { useState } from "react";
import { stageCatalogue, totalBoxCount } from "./domain/stages";
import { useProgress } from "./hooks/useProgress";
import { detectLocale, messages } from "./i18n";

type View = "stages" | "settings" | "about";

const headingIds = {
  stages: "busybox-stages-heading",
  settings: "busybox-settings-heading",
  about: "busybox-about-heading",
} as const;

export function App() {
  const progress = useProgress(detectLocale());
  const locale = progress.document.settings.locale;
  const [view, setView] = useState<View>("stages");
  const copy = messages[locale];
  const solvedCount = Object.keys(progress.document.boxes).length;
  const storageMessage = {
    loading: copy.storageLoading,
    ready: copy.storageReady,
    unavailable: copy.storageUnavailable,
    corrupt: copy.storageCorrupt,
    future: copy.storageFuture,
  }[progress.storageState];

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
        {view === "stages" && (
          <section aria-labelledby={headingIds.stages}>
            <div className="section-heading">
              <h2 id={headingIds.stages}>{copy.stages}</h2>
              <p>
                {copy.progress}: {solvedCount} / {totalBoxCount}
              </p>
            </div>
            <ol className="stage-grid">
              {stageCatalogue.map((stage) => (
                <li
                  key={stage.id}
                  className={`stage-card stage-card--${stage.category}`}
                >
                  <div className="gift-box" aria-hidden="true">
                    <span />
                  </div>
                  <div>
                    <p className="stage-card__id">{stage.id}</p>
                    <h3>{stage.name[locale]}</h3>
                    <p>
                      {stage.boxCount} {copy.boxes} · {copy.planned}
                    </p>
                  </div>
                  <button type="button" disabled>
                    {copy.start}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

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
