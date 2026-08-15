import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s310Locale } from "./S-310.locale";

interface LaunchParamsLike {
  targetURL?: string;
}

interface LaunchQueueLike {
  setConsumer(consumer: (params: LaunchParamsLike) => void): void;
}

/**
 * S-310
 *
 * Gimmick: Re-enter the installed PWA through a URL delivered to its launch queue.
 * Uses: launchQueue consumer and a stage-scoped target URL.
 * Success: Consume a target URL carrying both the S-310 stage and busybox launch marker.
 * Privacy/Permission: No permission; inspect only the two expected URL parameters.
 * Cleanup: Disable the non-removable launch consumer callback when the stage unmounts.
 * Human verification: H-005, H-021, H-023, H-025
 */
/**
 * S-310
 *
 * 目的: S-310の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S310Stage(props: StageComponentProps) {
  const problem = props.problem("S-310-B01");
  const shortcut = props.problem("S-310-B02");
  const note = props.problem("S-310-B03");
  const [status, setStatus] = useState("waiting");
  const targetUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", "S-310");
    url.searchParams.set("launch", "busybox");
    return url.href;
  }, []);

  useEffect(() => {
    let active = true;
    const inspect = (target: string) => {
      const url = new URL(target, location.href);
      const source = url.searchParams.get("source");
      if (source === "shortcut") shortcut.solve(["pwa:shortcut"]);
      if (source === "note") note.solve(["pwa:note-taking"]);
      if (
        url.searchParams.get("stage") === "S-310" &&
        url.searchParams.get("launch") === "busybox"
      ) {
        setStatus("launched");
        problem.solve(["launch-handler:target-url"]);
      }
    };
    inspect(location.href);
    const queue = (
      window as unknown as Window & { launchQueue: LaunchQueueLike }
    ).launchQueue;
    queue.setConsumer((params) => {
      if (!active || !params.targetURL) return;
      inspect(params.targetURL);
    });
    return () => {
      active = false;
    };
  }, [note.solve, problem.solve, shortcut.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <p className="measurement">
        {stageText(props.locale, s310Locale.relaunchHint)}
      </p>
      <a className="stage-action" href={targetUrl}>
        {stageText(props.locale, s310Locale.launchUrl)}
      </a>
      <p className="launch-url">{targetUrl}</p>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={shortcut} locale={props.locale} />
        <ProblemGiftBox problem={note} locale={props.locale} />
      </div>
    </div>
  );
}
