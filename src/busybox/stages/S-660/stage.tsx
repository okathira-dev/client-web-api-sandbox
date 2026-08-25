import MemoryOutlined from "@mui/icons-material/MemoryOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

function boxIndexFor(state: PressureState) {
  if (state === "nominal") return 0;
  if (state === "critical") return 2;
  return 1;
}

/**
 * S-660 — Compute Pressureの状態を負荷計ではなくbrowserの状態hintとして読む。
 * 目的: nominal、fair/serious、criticalの3箱を、ゲーム側の負荷なしで観測する。
 * 最初の一手: stageへ入ったまま自動購読を待ち、必要なら別作業負荷の変化を観察する。
 * 箱ごとの成功条件: B01はnominal、B02はfairまたはserious、B03はcriticalをPressureObserverから受けた時に開く。
 * 開かない操作: CPUをbusybox側で意図的に消費する、割合を推定する、status文字列を書き換える操作では開かない。
 * API/権限: PressureObserverのcpu source。権限・入力値・状態履歴は保存・送信しない。
 * cleanup/環境: hiddenでdisconnectし、visibleで再購読する。対応環境とPermissions Policyを含めH-004/H-019/H-023/H-025/H-035を確認する。
 */
function S660Stage(props: Props) {
  const problems = [props.boxes.B01, props.boxes.B02, props.boxes.B03] as const;
  const observer = useRef<PressureObserver | null>(null);
  const [state, setState] = useState<PressureState | "waiting">("waiting");
  const [status, setStatus] = useState("");

  const stop = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
  }, []);

  useEffect(() => {
    let disposed = false;
    const observe = async () => {
      if (disposed || observer.current || document.visibilityState === "hidden")
        return;
      const Constructor = window.PressureObserver;
      if (!Constructor?.knownSources.includes("cpu")) {
        setStatus(stageText(props.locale, locale.unavailable));
        return;
      }
      const instance = new Constructor((records) => {
        const latest = records.at(-1)?.state;
        if (!latest) return;
        setState(latest);
        problems[boxIndexFor(latest)]?.solve();
        setStatus(`${stageText(props.locale, locale.cpuPrefix)}=${latest}`);
      });
      observer.current = instance;
      setStatus(stageText(props.locale, locale.observing));
      try {
        await instance.observe("cpu", { sampleInterval: 1_000 });
      } catch {
        if (observer.current === instance) stop();
        setStatus(stageText(props.locale, locale.observeFailed));
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        stop();
        return;
      }
      void observe();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    void observe();
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [problems, props.locale, stop]);

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
      <p className="measurement">{state}</p>
      <p className="interaction-status" role="status">
        {status || stageText(props.locale, locale.idle)}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: MemoryOutlined,
      color: "#a7f3d0",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: MemoryOutlined,
      color: "#6ee7b7",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: MemoryOutlined,
      color: "#10b981",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      window.PressureObserver?.knownSources.includes("cpu")
        ? "available"
        : "unsupported",
    ),
  Component: S660Stage,
});
