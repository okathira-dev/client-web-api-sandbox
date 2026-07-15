import { useState } from "react";
import { stageCatalogue, totalBoxCount } from "./domain/stages";
import { detectLocale, type Locale, messages } from "./i18n";

type View = "stages" | "settings" | "about";

const headingIds = {
  stages: "busybox-stages-heading",
  settings: "busybox-settings-heading",
  about: "busybox-about-heading",
} as const;

export function App() {
  const [locale, setLocale] = useState<Locale>(() => detectLocale());
  const [view, setView] = useState<View>("stages");
  const copy = messages[locale];

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
                {copy.progress}: 0 / {totalBoxCount}
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
                  onChange={() => setLocale("ja")}
                />{" "}
                {copy.japanese}
              </label>
              <label>
                <input
                  type="radio"
                  name="locale"
                  checked={locale === "en"}
                  onChange={() => setLocale("en")}
                />{" "}
                {copy.english}
              </label>
            </fieldset>
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
