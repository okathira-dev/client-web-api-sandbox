import InstallDesktopOutlined from "@mui/icons-material/InstallDesktopOutlined";
import ShareOutlined from "@mui/icons-material/ShareOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

type InteractionState = "idle" | "active" | "cancelled" | "unavailable";

/**
 * S-240
 *
 * 目的: 「渡した印」で、B01「共有の箱」、B02「共有先の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-240の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S240Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const targetProblem = props.boxes[manifest.box.B02];
  const mark = useMemo(() => crypto.randomUUID().slice(0, 6).toUpperCase(), []);
  const [status, setStatus] = useState<InteractionState>("idle");
  useEffect(() => {
    const url = new URL(location.href);
    if (url.searchParams.get("share-target") === "1") {
      targetProblem.solve();
      url.searchParams.delete("share-target");
      history.replaceState(history.state, "", url);
    }
  }, [targetProblem.solve]);

  const share = async () => {
    try {
      await navigator.share({
        title: "Busybox",
        text: `${stageText(props.locale, locale.shareMark)} ${mark}`,
      });
      if (props.signal.aborted) return;
      // Only a resolved OS flow counts; opening and cancelling the sheet does not.
      problem.solve();
      setStatus("active");
    } catch (error) {
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <code className="clipboard-token">{mark}</code>
      <button
        type="button"
        className="stage-action"
        onClick={() => void share()}
      >
        {stageText(props.locale, locale.share)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
        <StageProblemGiftBox box={targetProblem} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: ShareOutlined,
      color: "#34d399",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: InstallDesktopOutlined,
      color: "#10b981",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "share" in navigator ? "permission-required" : "unsupported",
    ),
  Component: S240Stage,
});
