import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-370 — real BatteryManager charging changes and 75% bands. H-004/H-019/H-023. */
/**
 * S-370
 *
 * 目的: S-370の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S370Stage(props: StageComponentProps) {
  const plugged = props.problem("S-370-B01");
  const unplugged = props.problem("S-370-B02");
  const high = props.problem("S-370-B03");
  const low = props.problem("S-370-B04");
  const [status, setStatus] = useState("…");
  useEffect(() => {
    let battery: BatteryManager | undefined;
    const inspectLevel = () => {
      if (!battery) return;
      setStatus(`${Math.round(battery.level * 100)}%`);
      if (battery.level >= 0.75) high.solve(["battery:high"]);
      else low.solve(["battery:low"]);
    };
    const inspectCharging = () => {
      if (!battery) return;
      if (battery.charging) plugged.solve(["battery:plugged"]);
      else unplugged.solve(["battery:unplugged"]);
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
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{status}</p>
    </div>
  );
}
