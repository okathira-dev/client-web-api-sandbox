import SignalWifiOffOutlined from "@mui/icons-material/SignalWifiOffOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useState } from "react";

/**
 * S-070
 *
 * 目的: 「通信のない返事」で、B01「オフラインの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-070の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S070Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const observe = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) problem.solve();
    };
    window.addEventListener("online", observe);
    window.addEventListener("offline", observe);
    observe();
    return () => {
      window.removeEventListener("online", observe);
      window.removeEventListener("offline", observe);
    };
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`signal-clue ${online ? "" : "signal-clue--offline"}`}
        aria-hidden="true"
      >
        ⌁
      </div>
      <p role="status">{online ? "•••" : "×"}</p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SignalWifiOffOutlined,
      color: "#2dd4bf",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "serviceWorker" in navigator && "caches" in window
        ? "available"
        : "unsupported",
    ),
  Component: S070Stage,
});
