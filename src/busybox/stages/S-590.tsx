import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

interface Anchor {
  latitude: number;
  longitude: number;
  accuracy: number;
  at: number;
}
const anchorKey = "busybox:S-590:anchor";
function distance(a: Anchor, b: GeolocationCoordinates) {
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * S-590
 *
 * 目的: 「出発点から」で、B01「5mの箱」、B02「25mの箱」、B03「100mの箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-590の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S590Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-590-B01"),
    props.problem("S-590-B02"),
    props.problem("S-590-B03"),
  ] as const;
  const [solveFive, solveTwentyFive, solveHundred] = problems.map(
    (problem) => problem.solve,
  );
  const [meters, setMeters] = useState(0);
  useEffect(() => {
    let anchor: Anchor | null = null;
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(anchorKey) ?? "null",
      ) as Anchor | null;
      if (stored && Date.now() - stored.at < 86400000) anchor = stored;
    } catch {
      sessionStorage.removeItem(anchorKey);
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        if (!anchor) {
          anchor = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            at: Date.now(),
          };
          sessionStorage.setItem(anchorKey, JSON.stringify(anchor));
          return;
        }
        const conservative = Math.max(
          0,
          distance(anchor, position.coords) -
            anchor.accuracy -
            position.coords.accuracy,
        );
        setMeters(conservative);
        if (conservative >= 5) solveFive?.(["distance:5m"]);
        if (conservative >= 25) solveTwentyFive?.(["distance:25m"]);
        if (conservative >= 100) {
          solveHundred?.(["distance:100m"]);
          sessionStorage.removeItem(anchorKey);
        }
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [solveFive, solveHundred, solveTwentyFive]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{meters.toFixed(1)}m</p>
    </div>
  );
}
