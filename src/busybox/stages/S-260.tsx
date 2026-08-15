import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s260Locale } from "./S-260.locale";

type PeripheralStatus = "idle" | "read" | "cancelled" | "unavailable";

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}

interface EyeDropperWindow extends Window {
  EyeDropper: new () => EyeDropperInstance;
}

const EYEDROPPER_TARGET = "#a78bfa";

/**
 * S-260
 *
 * Gimmick: Pick the exact purple rendered by the stage from anywhere on screen.
 * Uses: EyeDropper API with the stage AbortSignal.
 * Success: The normalized sRGB result equals #a78bfa.
 * Privacy/Permission: Open the picker only from an action; retain only the chosen hex value.
 * Cleanup: Abort an open picker automatically when the stage exits.
 * Human verification: H-006, H-023, H-025
 */
/**
 * S-260
 *
 * 目的: S-260の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S260Stage(props: StageComponentProps) {
  const problem = props.problem("S-260-B01");
  const [picked, setPicked] = useState("—");
  const [status, setStatus] = useState<PeripheralStatus>("idle");

  const pick = async () => {
    try {
      const EyeDropperApi = (window as unknown as EyeDropperWindow).EyeDropper;
      const result = await new EyeDropperApi().open({ signal: props.signal });
      if (props.signal.aborted) return;
      const normalized = result.sRGBHex.toLowerCase();
      setPicked(normalized);
      setStatus("read");
      if (normalized === EYEDROPPER_TARGET) {
        problem.solve(["eyedropper:target-color"]);
      }
    } catch (error) {
      if (props.signal.aborted) return;
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <button
        type="button"
        className="eyedropper-target"
        style={{ background: EYEDROPPER_TARGET }}
        onClick={() => void pick()}
        aria-label={stageText(props.locale, s260Locale.purpleTarget)}
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void pick()}
      >
        {stageText(props.locale, s260Locale.pickDrop)}
      </button>
      <p className="measurement">{picked}</p>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
