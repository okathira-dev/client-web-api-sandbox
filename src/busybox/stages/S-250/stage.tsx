import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

type Color = "R" | "G" | "B";
type Message = { type: "alive" | "closing"; color: Color; sender: string };

/**
 * S-250
 *
 * 目的: 「一つだけの鍵」で、B01「白になる箱」、B02「閉じる順番の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-250の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S250Stage(props: Props) {
  const white = props.boxes[manifest.box.B01];
  const order = props.boxes[manifest.box.B02];
  const params = useMemo(() => new URL(location.href).searchParams, []);
  const color = params.get("color") as Color | null;
  const sender = useMemo(() => crypto.randomUUID(), []);
  const [active, setActive] = useState<Set<Color>>(new Set());
  const closed = useRef<Color[]>([]);
  useEffect(() => {
    const channel = new BroadcastChannel("busybox:S-250:rgb");
    const last = new Map<Color, number>();
    const receive = (event: MessageEvent<Message>) => {
      if (event.data.sender === sender) return;
      if (event.data.type === "alive") last.set(event.data.color, Date.now());
      else {
        closed.current.push(event.data.color);
        if (closed.current.join("") === "BGR") order.solve();
        else if (!"BGR".startsWith(closed.current.join("")))
          closed.current = [];
      }
    };
    channel.addEventListener("message", receive);
    const heartbeat = color
      ? window.setInterval(
          () =>
            channel.postMessage({
              type: "alive",
              color,
              sender,
            } satisfies Message),
          500,
        )
      : undefined;
    if (color)
      channel.postMessage({ type: "alive", color, sender } satisfies Message);
    const inspect = color
      ? undefined
      : window.setInterval(() => {
          const now = Date.now();
          const next = new Set(
            [...last]
              .filter(([, at]) => now - at < 1800)
              .map(([value]) => value),
          );
          setActive(next);
          if (next.size === 3) white.solve();
        }, 400);
    const closing = () => {
      if (color)
        channel.postMessage({
          type: "closing",
          color,
          sender,
        } satisfies Message);
    };
    window.addEventListener("pagehide", closing);
    return () => {
      window.removeEventListener("pagehide", closing);
      if (heartbeat) clearInterval(heartbeat);
      if (inspect) clearInterval(inspect);
      channel.close();
    };
  }, [color, order.solve, sender, white.solve]);
  if (color)
    return (
      <div
        className={`puzzle puzzle--centered rgb-page rgb-page--${color.toLowerCase()}`}
      >
        <p className="measurement">{color}</p>
      </div>
    );
  const openNext = () => {
    const sequence: Color[] = ["R", "G", "B"];
    const index = Number(sessionStorage.getItem("busybox:S-250:next") ?? 0) % 3;
    sessionStorage.setItem("busybox:S-250:next", String(index + 1));
    const url = new URL(location.href);
    url.searchParams.set("color", sequence[index] ?? "R");
    window.open(url, "_blank");
  };
  return (
    <div
      className={`puzzle puzzle--centered ${active.size === 3 ? "rgb-monitor--white" : ""}`}
    >
      <div className="problem-row">
        <StageProblemGiftBox box={white} locale={props.locale} />
        <StageProblemGiftBox box={order} locale={props.locale} />
      </div>
      <button type="button" className="stage-action" onClick={openNext}>
        {stageText(props.locale, locale.openNextColor)}
      </button>
      <p className="measurement">{[...active].sort().join(" + ") || "…"}</p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: LockOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: HourglassEmptyOutlined,
      color: "#fb7185",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "locks" in navigator && "BroadcastChannel" in window
        ? "available"
        : "unsupported",
    ),
  Component: S250Stage,
});
