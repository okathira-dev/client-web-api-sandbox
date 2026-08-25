import ColorizeOutlined from "@mui/icons-material/ColorizeOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

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
 * 目的: 「画面の一滴」で、B01「色を採る箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-260の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S260Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
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
        problem.solve();
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
        aria-label={stageText(props.locale, locale.purpleTarget)}
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void pick()}
      >
        {stageText(props.locale, locale.pickDrop)}
      </button>
      <p className="measurement">{picked}</p>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
      <StageProblemGiftBox box={problem} locale={props.locale} />
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: ColorizeOutlined,
      color: "#a78bfa",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "EyeDropper" in window
        ? "permission-required"
        : "unsupported",
    ),
  Component: S260Stage,
});
