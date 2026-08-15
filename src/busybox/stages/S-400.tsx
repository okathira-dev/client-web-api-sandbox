import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-400 — compare wall-clock movement with monotonic time: -60±5 minutes, then restore baseline. H-004/H-019/H-022. */
/**
 * S-400
 *
 * 目的: S-400の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S400Stage(props: StageComponentProps) {
  const rewind = props.problem("S-400-B01");
  const restore = props.problem("S-400-B02");
  const baseline = useRef({ wall: Date.now(), monotonic: performance.now() });
  const rewound = useRef(false);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const inspect = () => {
      const expected =
        baseline.current.wall +
        (performance.now() - baseline.current.monotonic);
      const minutes = (Date.now() - expected) / 60000;
      setOffset(minutes);
      if (minutes >= -65 && minutes <= -55) {
        rewound.current = true;
        rewind.solve(["clock:minus-one-hour"]);
      }
      if (rewound.current && Math.abs(minutes) <= 5)
        restore.solve(["clock:restored"]);
    };
    inspect();
    const timer = window.setInterval(inspect, 1000);
    return () => window.clearInterval(timer);
  }, [restore.solve, rewind.solve]);
  const display = new Date(Date.now() - 60 * 60 * 1000);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={rewind} locale={props.locale} />
        <ProblemGiftBox problem={restore} locale={props.locale} />
      </div>
      <time className="analog-clock" dateTime={display.toISOString()}>
        {display.toLocaleTimeString(props.locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </time>
      <p className="measurement">{offset.toFixed(1)} min</p>
    </div>
  );
}
