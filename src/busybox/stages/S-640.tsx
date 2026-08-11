import { useState } from "react";
import {
  encodingFixtures,
  encodingProblemIdAt,
  encodingQuestionText,
} from "../fixtures/encoding";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export default function S640Stage(props: StageComponentProps) {
  const [answer, setAnswer] = useState("");
  return (
    <div className="puzzle parallel-puzzle">
      <div className="problem-row problem-row--wrap">
        {encodingFixtures.map((_fixture, index) => {
          const id = encodingProblemIdAt(index);
          return (
            <ProblemGiftBox
              key={id}
              problem={props.problem(id)}
              locale={props.locale}
            />
          );
        })}
      </div>
      <section className="encoding-group">
        <h2>{props.locale === "ja" ? "文字化け" : "Mojibake"}</h2>
        <div className="encoding-question-grid">
          {encodingFixtures.map((fixture, index) => {
            const id = encodingProblemIdAt(index);
            return (
              <article key={id} className="parallel-question-card">
                <strong>{id}</strong>
                <code>{encodingQuestionText(fixture)}</code>
              </article>
            );
          })}
        </div>
      </section>
      <label className="parallel-answer">
        {props.locale === "ja" ? "復号した文字列" : "Decoded text"}
        <input
          value={answer}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const index = encodingFixtures.findIndex(
              (fixture) => fixture.expectedText === next,
            );
            if (index < 0) return;
            props.problem(encodingProblemIdAt(index)).solve(["encoding:text"]);
          }}
          aria-label={
            props.locale === "ja" ? "共通の復号回答" : "Shared decoded answer"
          }
        />
      </label>
    </div>
  );
}
