import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

interface TrailState {
  busyboxTrail?: { depth: number; ready: boolean };
}

function currentTrail() {
  const state = window.history.state as TrailState | null;
  return state?.busyboxTrail;
}

/**
 * S-220
 *
 * Gimmick: Build three same-document history entries, then walk Back to their base.
 * Uses: History API state, query strings, and the app's navigation remount.
 * Success: Enter with a ready trail whose depth has returned to zero.
 * Privacy/Permission: No permission; history state contains only depth and readiness.
 * Cleanup: Replace the base URL before adding bounded entries; no listener is retained.
 * Human verification: H-001, H-002, H-003, H-022, H-025
 */
export default function S220Stage(props: StageComponentProps) {
  const problem = props.problem("S-220-B01");
  const [depth, setDepth] = useState(() => currentTrail()?.depth ?? 0);

  useEffect(() => {
    const trail = currentTrail();
    setDepth(trail?.depth ?? 0);
    if (trail?.ready && trail.depth === 0) {
      problem.solve(["history:returned-to-base"]);
    }
  }, [problem.solve]);

  const buildTrail = () => {
    const baseUrl = new URL(window.location.href);
    baseUrl.searchParams.delete("trail");
    const baseState = {
      ...(window.history.state as object),
      busyboxTrail: { depth: 0, ready: true },
    };
    window.history.replaceState(baseState, "", baseUrl);
    for (let nextDepth = 1; nextDepth <= 3; nextDepth += 1) {
      const url = new URL(baseUrl);
      url.searchParams.set("trail", String(nextDepth));
      window.history.pushState(
        { ...baseState, busyboxTrail: { depth: nextDepth, ready: true } },
        "",
        url,
      );
    }
    setDepth(3);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="history-trail" aria-hidden="true">
        {["first", "second", "third"].map((stepName, index) => (
          <span key={stepName} data-active={index < depth} />
        ))}
      </div>
      <button type="button" className="stage-action" onClick={buildTrail}>
        {props.locale === "ja" ? "道を3つ積む" : "Build three steps"}
      </button>
      <p className="measurement">
        {depth === 3
          ? props.locale === "ja"
            ? "ブラウザの戻るを3回"
            : "Use browser Back three times"
          : `${depth} / 3`}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
