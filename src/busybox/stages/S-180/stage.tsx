import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

type ClipboardStatus =
  | ""
  | "sentReversed"
  | "copyUnavailable"
  | "returnedUpright"
  | "clipboardUnreadable";

/**
 * S-180
 *
 * 目的: 「見えない受け渡し」で、B01「コピーの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-180の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S180Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [armed, setArmed] = useState(false);
  const [status, setStatus] = useState<ClipboardStatus>("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("xobysub");
      if (props.signal.aborted) return;
      setArmed(true);
      setStatus("sentReversed");
    } catch {
      if (!props.signal.aborted) setStatus("copyUnavailable");
    }
  };

  const inspect = async () => {
    try {
      const value = await navigator.clipboard.readText();
      if (props.signal.aborted) return;
      if (armed && value === "busybox") {
        problem.solve();
        setStatus("returnedUpright");
      }
    } catch {
      if (!props.signal.aborted) setStatus("clipboardUnreadable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <StageProblemGiftBox box={problem} locale={props.locale} />
      <button
        type="button"
        className="stage-action"
        onClick={() => void copy()}
      >
        {stageText(props.locale, locale.copyReversed)}
      </button>
      <button
        type="button"
        className="stage-action"
        onClick={() => void inspect()}
      >
        {stageText(props.locale, locale.inspect)}
      </button>
      <p className="interaction-status" role="status">
        {status
          ? stageText(
              props.locale,
              locale[status as Exclude<ClipboardStatus, "">],
            )
          : null}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: ContentCopyOutlined,
      color: "#a78bfa",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "clipboard" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S180Stage,
});
