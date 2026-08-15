import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s080Locale } from "./S-080.locale";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * S-080
 *
 * Gimmick: PWA display mode changes the entry context.
 * Uses: matchMedia with display-mode: standalone.
 * Success: Observe display-mode: standalone from an installed launch.
 * Privacy/Permission: No permission; only the display-mode fact is retained.
 * Cleanup: Remove the media-query listener on unmount.
 * Human verification: H-005, H-023, H-025
 */
/**
 * S-080
 *
 * 目的: S-080の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S080Stage(props: StageComponentProps) {
  const problem = props.problem("S-080-B01");
  const [standalone, setStandalone] = useState(isStandalone);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const observe = () => {
      setStandalone(media.matches);
      if (media.matches) problem.solve(["display-mode:standalone"]);
    };
    media.addEventListener("change", observe);
    observe();
    return () => media.removeEventListener("change", observe);
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`door-clue ${standalone ? "door-clue--open" : ""}`}
        aria-hidden="true"
      >
        ▯
      </div>
      <p>{stageText(props.locale, s080Locale.installHint)}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
