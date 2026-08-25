import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

type PeripheralStatus = "idle" | "active" | "unavailable";

interface BadgeNavigator extends Navigator {
  setAppBadge(contents?: number): Promise<void>;
  clearAppBadge(): Promise<void>;
}

/**
 * S-210
 *
 * 目的: 「外側の数字」で、B01「外側の数字の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-210の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S210Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<PeripheralStatus>("idle");
  const levelRef = useRef(0);

  useEffect(() => {
    const cleanup = () => {
      const badge = navigator as unknown as Partial<BadgeNavigator>;
      void badge.clearAppBadge?.().catch(() => undefined);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [props.signal]);

  const advance = async () => {
    const badge = navigator as unknown as BadgeNavigator;
    const next = Math.min(3, levelRef.current + 1);
    try {
      await badge.setAppBadge(next);
      if (props.signal.aborted) {
        void badge.clearAppBadge().catch(() => undefined);
        return;
      }
      levelRef.current = next;
      setLevel(next);
      setStatus("active");
      if (next === 3) problem.solve();
    } catch {
      if (!props.signal.aborted) setStatus("unavailable");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="badge-preview" aria-hidden="true">
        B<span>{level || "·"}</span>
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void advance()}
      >
        {stageText(props.locale, locale.advanceBadge)}
      </button>
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
      icon: BadgeOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "setAppBadge" in navigator
        ? "available"
        : "unsupported",
    ),
  Component: S210Stage,
});
