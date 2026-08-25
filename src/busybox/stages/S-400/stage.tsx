import KeyboardReturnOutlined from "@mui/icons-material/KeyboardReturnOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
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
 * S-400
 *
 * 目的: 「一時間ずれた時計」で、B01「巻き戻しの箱」、B02「現在へ戻す箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-400の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S400Stage(props: Props) {
  const rewind = props.boxes[manifest.box.B01];
  const restore = props.boxes[manifest.box.B02];
  const baseline = useRef({ wall: Date.now(), monotonic: performance.now() });
  const rewound = useRef(false);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const inspect = () => {
      const expected =
        baseline.current.wall +
        (performance.now() - baseline.current.monotonic);
      const minutes = (Date.now() - expected) / 60000;
      setOffset(minutes);
      if (minutes >= -65 && minutes <= -55) {
        rewound.current = true;
        rewind.solve();
      }
      if (rewound.current && Math.abs(minutes) <= 5) restore.solve();
    };
    inspect();
    const timer = window.setInterval(inspect, 1000);
    return () => window.clearInterval(timer);
  }, [restore.solve, rewind.solve]);
  const display = new Date(Date.now() - 60 * 60 * 1000);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <StageProblemGiftBox box={rewind} locale={props.locale} />
        <StageProblemGiftBox box={restore} locale={props.locale} />
      </div>
      <time className="analog-clock" dateTime={display.toISOString()}>
        {display.toLocaleTimeString(props.locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </time>
      <p className="measurement">{offset.toFixed(1)} min</p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: ScheduleOutlined,
      color: "#818cf8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: KeyboardReturnOutlined,
      color: "#34d399",
      label: locale.B02,
    },
  },
  probe: () => "available",
  Component: S400Stage,
});
