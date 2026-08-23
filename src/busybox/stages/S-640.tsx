import { useState } from "react";
import {
  encodingFixtures,
  encodingProblemIdAt,
  encodingQuestionText,
} from "../fixtures/encoding";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s640Locale } from "./S-640.locale";

/**
 * S-640 — 文字化けを元の符号化へ戻す並列問題。
 * 目的: 文字コードを推理し、表示された8枚を一つの回答欄で復号する。
 * 最初の一手: 各カードの崩れた文字列と、カードの2種類の符号化を照合する。
 * 箱ごとの成功条件: B01〜B08は対応する元文字列を正確に入力した時だけ開く。
 * 開かない操作: 符号化名の入力、別カードの文字列、部分一致では開かない。
 * API/権限: TextDecoderのlegacy encodingとGit管理fixture。権限・送信・回答保存はない。
 * cleanup/環境: 共通回答欄は入場中だけ保持する。legacy encoding対応ブラウザでH-001/H-002/H-003/H-004/H-014/H-020/H-025/H-033を確認する。
 */
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
        <h2>{stageText(props.locale, s640Locale.mojibake)}</h2>
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
        {stageText(props.locale, s640Locale.decoded)}
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
          aria-label={stageText(props.locale, s640Locale.sharedAnswer)}
        />
      </label>
    </div>
  );
}
