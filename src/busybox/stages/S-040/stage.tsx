import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";

/**
 * S-040
 *
 * 目的: 「見ない時間」で、B01「見ない時間の箱」、B02「長い不在の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-040の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S040Stage(props: Props) {
  const hiddenAt = useRef<number | null>(null);
  const [hiddenSeconds, setHiddenSeconds] = useState(0);
  const problem = props.boxes[manifest.box.B01];
  const longProblem = props.boxes[manifest.box.B02];

  useEffect(() => {
    const observeVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt.current = performance.now();
        return;
      }
      if (hiddenAt.current !== null) {
        const duration = performance.now() - hiddenAt.current;
        setHiddenSeconds(Math.floor(duration / 1000));
        if (duration >= 2000) problem.solve();
        if (duration >= 25 * 60 * 1000) longProblem.solve();
        hiddenAt.current = null;
      }
    };
    document.addEventListener("visibilitychange", observeVisibility);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("visibilitychange", observeVisibility),
      { once: true },
    );
    return () =>
      document.removeEventListener("visibilitychange", observeVisibility);
  }, [longProblem.solve, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div className="eye-clue" aria-hidden="true">
        ◉
      </div>
      <p className="measurement" aria-live="polite">
        {hiddenSeconds || "…"}
      </p>
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
        <StageProblemGiftBox box={longProblem} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: VisibilityOffOutlined,
      color: "#94a3b8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: VisibilityOffOutlined,
      color: "#64748b",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "visibilityState" in document ? "available" : "unsupported",
    ),
  Component: S040Stage,
});
