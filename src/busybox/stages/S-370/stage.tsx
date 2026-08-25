import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import WbSunnyOutlined from "@mui/icons-material/WbSunnyOutlined";
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
 * S-370
 *
 * 目的: 「電気の境目」で、B01「接続の箱」、B02「取り外しの箱」、B03「75%以上の箱」、B04「75%未満の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-370の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S370Stage(props: Props) {
  const plugged = props.boxes[manifest.box.B01];
  const unplugged = props.boxes[manifest.box.B02];
  const high = props.boxes[manifest.box.B03];
  const low = props.boxes[manifest.box.B04];
  const [status, setStatus] = useState("…");
  useEffect(() => {
    let battery: BatteryManager | undefined;
    const inspectLevel = () => {
      if (!battery) return;
      setStatus(`${Math.round(battery.level * 100)}%`);
      if (battery.level >= 0.75) high.solve();
      else low.solve();
    };
    const inspectCharging = () => {
      if (!battery) return;
      if (battery.charging) plugged.solve();
      else unplugged.solve();
    };
    void navigator.getBattery?.().then((manager) => {
      if (props.signal.aborted) return;
      battery = manager;
      inspectLevel();
      battery.addEventListener("levelchange", inspectLevel);
      battery.addEventListener("chargingchange", inspectCharging);
    });
    return () => {
      battery?.removeEventListener("levelchange", inspectLevel);
      battery?.removeEventListener("chargingchange", inspectCharging);
    };
  }, [high.solve, low.solve, plugged.solve, props.signal, unplugged.solve]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {[plugged, unplugged, high, low].map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{status}</p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: WbSunnyOutlined,
      color: "#34d399",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: WbSunnyOutlined,
      color: "#fb7185",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: BadgeOutlined,
      color: "#facc15",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: BadgeOutlined,
      color: "#f59e0b",
      label: locale.B04,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "getBattery" in navigator ? "available" : "unsupported",
    ),
  Component: S370Stage,
});
