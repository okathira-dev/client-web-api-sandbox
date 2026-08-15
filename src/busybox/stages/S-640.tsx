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
/**
 * S-640
 *
 * 目的: S-640の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
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
