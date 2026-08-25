import DevicesFoldOutlined from "@mui/icons-material/DevicesFoldOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

interface BusyDevicePosture extends EventTarget {
  type: string;
}

interface PostureNavigator extends Navigator {
  devicePosture?: BusyDevicePosture;
}

/**
 * S-320
 *
 * 目的: 「折れ目をまたぐ」で、B01「折れ目の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-320の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S320Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [posture, setPosture] = useState("continuous");
  const [segments, setSegments] = useState(1);

  const inspect = useCallback(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const horizontal = window.matchMedia("(horizontal-viewport-segments: 2)");
    const vertical = window.matchMedia("(vertical-viewport-segments: 2)");
    const nextSegments = horizontal.matches || vertical.matches ? 2 : 1;
    const nextPosture = devicePosture?.type ?? "continuous";
    setSegments(nextSegments);
    setPosture(nextPosture);
    if (nextPosture === "folded" || nextSegments === 2) {
      problem.solve();
    }
  }, [problem.solve]);

  useEffect(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const queries = [
      window.matchMedia("(horizontal-viewport-segments: 2)"),
      window.matchMedia("(vertical-viewport-segments: 2)"),
    ];
    devicePosture?.addEventListener("change", inspect);
    for (const query of queries) query.addEventListener("change", inspect);
    inspect();
    const cleanup = () => {
      devicePosture?.removeEventListener("change", inspect);
      for (const query of queries) query.removeEventListener("change", inspect);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [inspect, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="fold-preview"
        data-folded={posture === "folded" || segments === 2}
      >
        <span />
        <i aria-hidden="true" />
        <span />
      </div>
      <p className="measurement">
        {stageText(
          props.locale,
          posture === "folded" ? locale.folded : locale.continuous,
        )}{" "}
        · {segments} {stageText(props.locale, locale.segment)}
      </p>
      <p className="interaction-status" role="status">
        {stageText(props.locale, locale.foldHint)}
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: DevicesFoldOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "devicePosture" in navigator ||
      CSS.supports("top: env(viewport-segment-top 0 0)")
        ? "available"
        : "unsupported",
    ),
  Component: S320Stage,
});
