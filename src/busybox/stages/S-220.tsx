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
  const backForward = props.problem("S-220-B02");
  const reload = props.problem("S-220-B03");
  const disposal = props.problem("S-220-B04");
  const [depth, setDepth] = useState(() => currentTrail()?.depth ?? 0);
  const [navigationStatus, setNavigationStatus] = useState("");
  const [branchRound, setBranchRound] = useState(() => {
    try {
      return Number(sessionStorage.getItem("busybox:S-220:branch-round") ?? 0);
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const navigation = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (navigation?.type === "back_forward")
      backForward.solve(["navigation:back-forward"]);
    if (navigation?.type === "reload") reload.solve(["navigation:reload"]);
    const pageShown = (event: PageTransitionEvent) => {
      if (event.persisted) backForward.solve(["navigation:bfcache"]);
    };
    window.addEventListener("pageshow", pageShown);
    const trail = currentTrail();
    setDepth(trail?.depth ?? 0);
    if (trail?.ready && trail.depth === 0) {
      problem.solve(["history:returned-to-base"]);
    }
    return () => window.removeEventListener("pageshow", pageShown);
  }, [backForward.solve, problem.solve, reload.solve]);

  useEffect(() => {
    const navigation = (window as unknown as { navigation?: NavigationLike })
      .navigation;
    const entry = navigation?.currentEntry;
    if (!navigation || !entry) {
      setNavigationStatus("Navigation API unavailable");
      return;
    }
    let branchCreated = false;
    const handleNavigate = () => {
      branchCreated = true;
      setNavigationStatus("native navigate event");
    };
    const handleEntryChange = () => {
      setNavigationStatus(
        `currententrychange; canGoForward=${String(navigation.canGoForward)}`,
      );
    };
    const handleDispose = () => {
      if (!branchCreated) return;
      disposal.solve(["navigation:entry-dispose"]);
      setNavigationStatus("current entry disposed");
    };
    navigation.addEventListener("navigate", handleNavigate);
    navigation.addEventListener("currententrychange", handleEntryChange);
    entry.addEventListener("dispose", handleDispose);
    return () => {
      navigation.removeEventListener("navigate", handleNavigate);
      navigation.removeEventListener("currententrychange", handleEntryChange);
      entry.removeEventListener("dispose", handleDispose);
    };
  }, [disposal.solve]);

  const createDisposableBranch = () => {
    const navigation = (window as unknown as { navigation?: NavigationLike })
      .navigation;
    if (!navigation) return;
    const nextRound = branchRound + 1;
    try {
      sessionStorage.setItem("busybox:S-220:branch-round", String(nextRound));
    } catch {
      // Session storage is only a visual aid; Navigation API remains the gate.
    }
    setBranchRound(nextRound);
    const url = new URL(window.location.href);
    url.searchParams.set("branch", crypto.randomUUID());
    void navigation.navigate(url.href);
  };

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
      <div
        className="navigation-branch-guide"
        role="img"
        aria-label="Navigation branch route"
      >
        <span data-active={branchRound === 0}>A</span>
        <span aria-hidden="true">→</span>
        <span data-active={branchRound > 0}>B</span>
        <span aria-hidden="true">← browser Back →</span>
        <span data-active={branchRound > 0}>C</span>
      </div>
      <p className="measurement">
        {depth === 3
          ? props.locale === "ja"
            ? "ブラウザの戻るを3回"
            : "Use browser Back three times"
          : `${depth} / 3`}
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={createDisposableBranch}
      >
        {props.locale === "ja"
          ? branchRound === 0
            ? "AからBへ進む"
            : "戻ったら別の枝Cへ進む"
          : branchRound === 0
            ? "Go from A to B"
            : "After Back, branch from A to C"}
      </button>
      <p className="interaction-status" role="status">
        {navigationStatus}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={backForward} locale={props.locale} />
        <ProblemGiftBox problem={reload} locale={props.locale} />
        <ProblemGiftBox problem={disposal} locale={props.locale} />
      </div>
    </div>
  );
}

interface NavigationEntryLike extends EventTarget {
  readonly key: string;
}

interface NavigationLike extends EventTarget {
  readonly canGoForward: boolean;
  readonly currentEntry: NavigationEntryLike | null;
  navigate(url: string): Promise<unknown>;
}
