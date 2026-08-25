import RouteOutlined from "@mui/icons-material/RouteOutlined";
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
 * S-600
 *
 * 目的: 「高さの三層」で、B01「100m未満の箱」、B02「100〜500mの箱」、B03「500m以上の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-600の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S600Stage(props: Props) {
  const problems = [
    props.boxes[manifest.box.B01],
    props.boxes[manifest.box.B02],
    props.boxes[manifest.box.B03],
  ] as const;
  const [solveLow, solveMiddle, solveHigh] = problems.map(
    (problem) => problem.solve,
  );
  const stable = useRef({ band: -1, count: 0, since: 0 });
  const [altitude, setAltitude] = useState<number | null>(null);
  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        const value = position.coords.altitude;
        const accuracy = position.coords.altitudeAccuracy;
        if (value === null || accuracy === null) return;
        setAltitude(value);
        const low = value - accuracy;
        const high = value + accuracy;
        const band =
          high < 100 ? 0 : low >= 100 && high < 500 ? 1 : low >= 500 ? 2 : -1;
        if (band < 0) {
          stable.current = { band: -1, count: 0, since: 0 };
          return;
        }
        if (stable.current.band !== band)
          stable.current = { band, count: 1, since: performance.now() };
        else stable.current.count += 1;
        if (
          stable.current.count >= 3 &&
          performance.now() - stable.current.since >= 5000
        )
          if (band === 0) solveLow?.();
          else if (band === 1) solveMiddle?.();
          else solveHigh?.();
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [solveHigh, solveLow, solveMiddle]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">
        {altitude === null ? "…" : `${altitude.toFixed(1)}m`}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: RouteOutlined,
      color: "#34d399",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: RouteOutlined,
      color: "#fbbf24",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: RouteOutlined,
      color: "#60a5fa",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "geolocation" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S600Stage,
});
