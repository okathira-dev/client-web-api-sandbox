import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { SensorStageShell, useStageSensor } from "../shared/sensorStage";
import { locale } from "./locale";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useRef } from "react";

/**
 * S-550
 *
 * 目的: 「重さが消える瞬間」で、B01「低加速度の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-550の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S550Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const run = useRef({ since: 0, count: 0 });
  const sensor = useStageSensor(
    props,
    () => new Accelerometer({ frequency: 60 }),
    (value) => {
      const magnitude = Math.hypot(value.x ?? 99, value.y ?? 99, value.z ?? 99);
      if (magnitude > 2) {
        run.current = { since: 0, count: 0 };
        return;
      }
      if (!run.current.since) run.current.since = performance.now();
      run.current.count += 1;
      if (run.current.count >= 3 && performance.now() - run.current.since >= 80)
        problem.solve();
    },
  );
  return (
    <SensorStageShell props={props} {...sensor}>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </SensorStageShell>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: HourglassEmptyOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "Accelerometer" in window ? "permission-required" : "unsupported",
    ),
  Component: S550Stage,
});
