import { useEffect, useState } from "react";
import { unicodeExpressionText, unicodeFixtures } from "../fixtures/unicode";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export default function S620Stage(props: StageComponentProps) {
  const [answer, setAnswer] = useState("");
  const [fontReady, setFontReady] = useState(false);
  const [fontStatus, setFontStatus] = useState("loading Unicode fixture font…");

  useEffect(() => {
    let active = true;
    const faces = [
      new FontFace(
        "BusyboxUnicode",
        `url(${
          new URL(
            "../fixtures/unicode/fonts/unifont-17.0.05-bmp-subset.woff2",
            import.meta.url,
          ).href
        })`,
      ),
      new FontFace(
        "BusyboxUnicode",
        `url(${
          new URL(
            "../fixtures/unicode/fonts/unifont-17.0.05-upper-subset.woff2",
            import.meta.url,
          ).href
        })`,
      ),
    ];
    void Promise.all(faces.map((face) => face.load()))
      .then((loaded) => {
        if (!active) return;
        loaded.forEach((face) => {
          document.fonts.add(face);
        });
        setFontReady(true);
        setFontStatus("");
      })
      .catch(() => {
        if (active) setFontStatus("Unicode fixture font unavailable");
      });
    return () => {
      active = false;
      faces.forEach((face) => {
        document.fonts.delete(face);
      });
    };
  }, []);

  return (
    <div className="puzzle">
      <div className="problem-row problem-row--wrap">
        {unicodeFixtures.map((fixture) => {
          const id = `S-620-${fixture.id}` as `S-620-B${number}`;
          const problem = props.problem(id);
          return (
            <ProblemGiftBox key={id} problem={problem} locale={props.locale} />
          );
        })}
      </div>
      <div
        className="encoding-question-grid"
        style={{ fontFamily: '"BusyboxUnicode", sans-serif' }}
      >
        {unicodeFixtures.map((fixture) => {
          const id = `S-620-${fixture.id}` as `S-620-B${number}`;
          return (
            <article key={id} className="parallel-question-card">
              <strong>{id}</strong>
              <span>{unicodeExpressionText(fixture)}</span>
            </article>
          );
        })}
      </div>
      <label className="parallel-answer">
        {props.locale === "ja" ? "答え" : "Answer"}
        <input
          inputMode="numeric"
          value={answer}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const fixture = unicodeFixtures.find(
              (candidate) => String(candidate.answer) === next,
            );
            if (!fixture) return;
            const id = `S-620-${fixture.id}` as `S-620-B${number}`;
            props.problem(id).solve(["unicode:answer"]);
          }}
          disabled={!fontReady}
          aria-label={props.locale === "ja" ? "共通の答え" : "Shared answer"}
        />
      </label>
      <p className="interaction-status" role="status">
        {fontStatus}
      </p>
    </div>
  );
}
