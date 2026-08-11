import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

function boxIndexFor(state: PressureState) {
  if (state === "nominal") return 0;
  if (state === "critical") return 2;
  return 1;
}

/** CPU pressure is an implementation-defined state hint, not a percentage meter. */
export default function S660Stage(props: StageComponentProps) {
  const problems = useMemo(
    () =>
      [
        props.problem("S-660-B01"),
        props.problem("S-660-B02"),
        props.problem("S-660-B03"),
      ] as const,
    [props.problem],
  );
  const observer = useRef<PressureObserver | null>(null);
  const [state, setState] = useState<PressureState | "waiting">("waiting");
  const [observing, setObserving] = useState(false);
  const [status, setStatus] = useState("");

  const stop = useCallback(() => {
    observer.current?.disconnect();
    observer.current = null;
    setObserving(false);
  }, []);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === "hidden") stop();
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", stopWhenHidden);
      observer.current?.disconnect();
      observer.current = null;
    };
  }, [stop]);

  const start = async () => {
    if (observing) return;
    const Constructor = window.PressureObserver;
    if (!Constructor?.knownSources.includes("cpu")) {
      setStatus(
        props.locale === "ja"
          ? "この環境ではCPU Pressureを購読できない"
          : "CPU Pressure is unavailable in this environment",
      );
      return;
    }
    const instance = new Constructor((records) => {
      const latest = records.at(-1)?.state;
      if (!latest) return;
      setState(latest);
      problems[boxIndexFor(latest)]?.solve([`cpu:${latest}`]);
      setStatus(`cpu=${latest}`);
    });
    observer.current = instance;
    setObserving(true);
    setStatus(
      props.locale === "ja" ? "CPU状態を購読中…" : "Observing CPU pressure…",
    );
    try {
      await instance.observe("cpu", { sampleInterval: 1_000 });
    } catch {
      if (observer.current === instance) stop();
      setStatus(
        props.locale === "ja"
          ? "CPU状態を購読できない"
          : "Could not observe CPU pressure",
      );
    }
  };

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
      <div className="stage-actions">
        <button
          type="button"
          className="stage-action"
          onClick={() => void start()}
          disabled={observing}
        >
          {props.locale === "ja" ? "CPU状態を購読" : "Observe CPU pressure"}
        </button>
        <button
          type="button"
          className="stage-action"
          onClick={stop}
          disabled={!observing}
        >
          {props.locale === "ja" ? "購読を停止" : "Stop observing"}
        </button>
      </div>
      <p className="measurement">{state}</p>
      <p className="interaction-status" role="status">
        {status ||
          (props.locale === "ja"
            ? "ゲーム側で負荷は発生させない"
            : "The game does not create load")}
      </p>
    </div>
  );
}
