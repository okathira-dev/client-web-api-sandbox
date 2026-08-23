import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s440Locale } from "./S-440.locale";

const key = "busybox:S-440:round";
/**
 * S-440
 *
 * 目的: 「.busyboxの入口」で、B01「ファイル起動の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-440の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S440Stage(props: StageComponentProps) {
  const problem = props.problem("S-440-B01");
  const round = useMemo(() => crypto.randomUUID(), []);
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    let active = true;
    window.launchQueue?.setConsumer(async (params) => {
      const handle = params.files[0];
      if (!active || !handle) return;
      try {
        const file = await handle.getFile();
        const payload = JSON.parse(await file.text()) as { round?: string };
        if (payload.round && payload.round === localStorage.getItem(key)) {
          problem.solve(["file-handler:busybox"]);
          setStatus(file.name);
        }
      } catch {
        setStatus("invalid");
      }
    });
    return () => {
      active = false;
    };
  }, [problem.solve]);
  const download = () => {
    localStorage.setItem(key, round);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ kind: "busybox", round })], {
        type: "application/x-busybox",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${round}.busybox`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("downloaded");
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button type="button" className="stage-action" onClick={download}>
        {stageText(props.locale, s440Locale.saveBusybox)}
      </button>
      <p role="status">{statusText(props.locale, status)}</p>
    </div>
  );
}
