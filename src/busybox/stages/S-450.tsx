import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s450Locale } from "./S-450.locale";

const key = "busybox:S-450:round";
/**
 * S-450
 *
 * 目的: 「専用の合図」で、B01「プロトコルの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-450の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S450Stage(props: StageComponentProps) {
  const problem = props.problem("S-450-B01");
  const round = useMemo(() => crypto.randomUUID(), []);
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    const inspect = (target: string) => {
      const outer = new URL(target, location.href);
      const protocol = outer.searchParams.get("protocol");
      if (!protocol) return;
      const value = decodeURIComponent(protocol);
      if (value === `web+busybox:open?round=${localStorage.getItem(key)}`) {
        problem.solve(["protocol-handler:launch"]);
        setStatus("launched");
      }
    };
    inspect(location.href);
    let active = true;
    window.launchQueue?.setConsumer((params) => {
      if (active) inspect(params.targetURL);
    });
    return () => {
      active = false;
    };
  }, [problem.solve]);
  const arm = () => {
    localStorage.setItem(key, round);
    location.href = `web+busybox:open?round=${round}`;
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button type="button" className="stage-action" onClick={arm}>
        {stageText(props.locale, s450Locale.sendPrivateSignal)}
      </button>
      <p role="status">{statusText(props.locale, status)}</p>
    </div>
  );
}
