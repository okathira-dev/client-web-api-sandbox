import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
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

interface LaunchParamsLike {
  targetURL?: string;
}

interface LaunchQueueLike {
  setConsumer(consumer: (params: LaunchParamsLike) => void): void;
}

/**
 * S-310
 *
 * 目的: 「もう一度の起動」で、B01「再起動の箱」、B02「ショートカットの箱」、B03「新しいメモの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-310の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S310Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const shortcut = props.boxes[manifest.box.B02];
  const note = props.boxes[manifest.box.B03];
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
      if (source === "shortcut") shortcut.solve();
      if (source === "note") note.solve();
      if (
        url.searchParams.get("stage") === "S-310" &&
        url.searchParams.get("launch") === "busybox"
      ) {
        setStatus("launched");
        problem.solve();
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
        {stageText(props.locale, locale.relaunchHint)}
      </p>
      <a className="stage-action" href={targetUrl}>
        {stageText(props.locale, locale.launchUrl)}
      </a>
      <p className="launch-url">{targetUrl}</p>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
        <StageProblemGiftBox box={shortcut} locale={props.locale} />
        <StageProblemGiftBox box={note} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: OpenInNewOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: OpenInNewOutlined,
      color: "#a78bfa",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: OpenInNewOutlined,
      color: "#818cf8",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "launchQueue" in window ? "available" : "unsupported",
    ),
  Component: S310Stage,
});
