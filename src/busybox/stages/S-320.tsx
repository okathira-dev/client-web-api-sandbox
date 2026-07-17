import { useCallback, useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

interface BusyDevicePosture extends EventTarget {
  type: string;
}

interface PostureNavigator extends Navigator {
  devicePosture?: BusyDevicePosture;
}

/**
 * S-320
 *
 * Gimmick: Make a fold or two viewport segments visible to the page.
 * Uses: Device Posture API and viewport-segment media queries.
 * Success: Observe posture folded or two horizontal/vertical viewport segments.
 * Privacy/Permission: No permission; retain only the folded-or-segmented fact.
 * Cleanup: Remove posture, media-query, and abort listeners on exit.
 * Human verification: H-023, H-025
 */
export default function S320Stage(props: StageComponentProps) {
  const problem = props.problem("S-320-B01");
  const [posture, setPosture] = useState("continuous");
  const [segments, setSegments] = useState(1);

  const inspect = useCallback(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const horizontal = window.matchMedia("(horizontal-viewport-segments: 2)");
    const vertical = window.matchMedia("(vertical-viewport-segments: 2)");
    const nextSegments = horizontal.matches || vertical.matches ? 2 : 1;
    const nextPosture = devicePosture?.type ?? "continuous";
    setSegments(nextSegments);
    setPosture(nextPosture);
    if (nextPosture === "folded" || nextSegments === 2) {
      problem.solve(["posture:folded-or-two-segments"]);
    }
  }, [problem.solve]);

  useEffect(() => {
    const devicePosture = (navigator as unknown as PostureNavigator)
      .devicePosture;
    const queries = [
      window.matchMedia("(horizontal-viewport-segments: 2)"),
      window.matchMedia("(vertical-viewport-segments: 2)"),
    ];
    devicePosture?.addEventListener("change", inspect);
    for (const query of queries) query.addEventListener("change", inspect);
    inspect();
    const cleanup = () => {
      devicePosture?.removeEventListener("change", inspect);
      for (const query of queries) query.removeEventListener("change", inspect);
    };
    props.signal.addEventListener("abort", cleanup, { once: true });
    return () => {
      props.signal.removeEventListener("abort", cleanup);
      cleanup();
    };
  }, [inspect, props.signal]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className="fold-preview"
        data-folded={posture === "folded" || segments === 2}
      >
        <span />
        <i aria-hidden="true" />
        <span />
      </div>
      <p className="measurement">
        {posture} · {segments} {props.locale === "ja" ? "面" : "segment(s)"}
      </p>
      <p className="interaction-status" role="status">
        {props.locale === "ja"
          ? "折りたたみ端末で折れ目を作る。"
          : "Create a fold on a foldable device."}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
