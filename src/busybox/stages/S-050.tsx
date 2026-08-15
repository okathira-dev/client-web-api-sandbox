import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s050Locale } from "./S-050.locale";

type ChannelMessage = { type: "hello" | "ack"; sender: string };

function isChannelMessage(value: unknown): value is ChannelMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Partial<ChannelMessage>;
  return (
    (message.type === "hello" || message.type === "ack") &&
    typeof message.sender === "string"
  );
}

/**
 * S-050
 *
 * Gimmick: BroadcastChannel connects two same-origin tabs.
 * Uses: BroadcastChannel with validated same-origin messages.
 * Success: Receive a validated hello or acknowledgement from another sender.
 * Privacy/Permission: No permission; messages contain only an ephemeral sender ID.
 * Cleanup: Close the channel on unmount or stage abort.
 * Human verification: H-013, H-025
 */
/**
 * S-050
 *
 * 目的: S-050の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S050Stage(props: StageComponentProps) {
  const sender = useMemo(() => crypto.randomUUID(), []);
  const [peer, setPeer] = useState(false);
  const problem = props.problem("S-050-B01");

  useEffect(() => {
    const channel = new BroadcastChannel("busybox-stage-S-050");
    const receive = (event: MessageEvent<unknown>) => {
      if (!isChannelMessage(event.data) || event.data.sender === sender) return;
      setPeer(true);
      problem.solve(["broadcast-peer"]);
      if (event.data.type === "hello") {
        channel.postMessage({ type: "ack", sender });
      }
    };
    channel.addEventListener("message", receive);
    channel.postMessage({ type: "hello", sender });
    const close = () => channel.close();
    props.signal.addEventListener("abort", close, { once: true });
    return close;
  }, [problem.solve, props.signal, sender]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="window-clue" aria-hidden="true">
        <span className="window-clue__pane">1</span>
        <span className="window-clue__pane">{peer ? "2" : "?"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => window.open(window.location.href, "_blank", "noopener")}
      >
        {stageText(props.locale, s050Locale.openAnother)}
      </button>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
