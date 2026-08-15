import { useEffect, useState } from "react";
import { unicodeExpressionText, unicodeFixtures } from "../fixtures/unicode";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s620Locale } from "./S-620.locale";

/**
 * S-620 — Unicode数字を読んで、共通の十進入力へ戻す。
 * 目的: 見た目の違う数字が同じ位置表記を持つことを体験する。
 * 最初の一手: 各カードの数字を読み、カードごとに十進値を考える。
 * 箱ごとの成功条件: B01〜B17は対応するASCII十進文字列だけで開く。
 * 開かない操作: 数字の貼り付け、他カードの値、空欄、入力イベントの偽装では開かない。
 * API/権限: Unicode code point、固定fixture、FontFace。権限・外部送信・回答保存はない。
 * cleanup/環境: font失敗はUIへ隔離し、入力値は入場中だけ保持する。H-001/H-002/H-003/H-004/H-014/H-020/H-025を確認する。
 */
/**
 * S-620
 *
 * 目的: S-620の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S620Stage(props: StageComponentProps) {
  const [answer, setAnswer] = useState("");
  const [fontReady, setFontReady] = useState(false);
  const [fontStatus, setFontStatus] = useState<"loading" | "unavailable" | "">(
    "loading",
  );

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
        if (active) setFontStatus("unavailable");
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
        {stageText(props.locale, s620Locale.answer)}
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
          aria-label={stageText(props.locale, s620Locale.sharedAnswer)}
        />
      </label>
      <p className="interaction-status" role="status">
        {fontStatus === "loading"
          ? stageText(props.locale, s620Locale.loadingFont)
          : fontStatus === "unavailable"
            ? stageText(props.locale, s620Locale.unavailableFont)
            : null}
      </p>
    </div>
  );
}
