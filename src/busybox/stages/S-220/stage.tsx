import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import KeyboardReturnOutlined from "@mui/icons-material/KeyboardReturnOutlined";
import SwapHorizOutlined from "@mui/icons-material/SwapHorizOutlined";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

interface TrailState {
  busyboxTrail?: { depth: number; ready: boolean };
}

function currentTrail() {
  const state = window.history.state as TrailState | null;
  return state?.busyboxTrail;
}

/**
 * S-220 — same-document履歴とNavigation APIの枝分かれを読む。
 * 目的: browserのBack、reload、forward枝の破棄を、ページ内のボタンと実履歴の組合せで体験する。
 * 最初の一手: B01は3段の履歴を積んでbrowser Backを3回、B02/B03は実Back-forwardとreloadを行う。B04はA→B→Back→Cへ進む。
 * 箱ごとの成功条件: B01はdepth 0への復帰、B02はback_forward、B03はreload、B04は旧entryのdisposeとcanGoForward=falseを観測した時に開く。
 * 開かない操作: pushStateだけの模倣、URL文字列の一致、page内Backボタン、forward枝を残したままでは開かない。
 * API/権限: History API、PerformanceNavigationTiming、pageshow、Navigation API。状態はdepth/readyと一時roundだけで、送信・個人情報保存はない。
 * cleanup/環境: pageshow・Navigation listenerを離脱時に外し、履歴の深さを3段に制限する。H-001/H-002/H-003/H-022/H-025を確認する。
 */
function S220Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const backForward = props.boxes[manifest.box.B02];
  const reload = props.boxes[manifest.box.B03];
  const disposal = props.boxes[manifest.box.B04];
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
    if (navigation?.type === "back_forward") backForward.solve();
    if (navigation?.type === "reload") reload.solve();
    const pageShown = (event: PageTransitionEvent) => {
      if (event.persisted) backForward.solve();
    };
    window.addEventListener("pageshow", pageShown);
    const trail = currentTrail();
    setDepth(trail?.depth ?? 0);
    if (trail?.ready && trail.depth === 0) {
      problem.solve();
    }
    return () => window.removeEventListener("pageshow", pageShown);
  }, [backForward.solve, problem.solve, reload.solve]);

  useEffect(() => {
    const navigation = (window as unknown as { navigation?: NavigationLike })
      .navigation;
    const entry = navigation?.currentEntry;
    if (!navigation || !entry) {
      setNavigationStatus(stageText(props.locale, locale.unavailable));
      return;
    }
    let branchCreated = false;
    const handleNavigate = () => {
      branchCreated = true;
      setNavigationStatus(stageText(props.locale, locale.nativeNavigate));
    };
    const handleEntryChange = () => {
      setNavigationStatus(
        `${stageText(props.locale, locale.currentEntry)}${String(navigation.canGoForward)}`,
      );
    };
    const handleDispose = () => {
      if (!branchCreated) return;
      disposal.solve();
      setNavigationStatus(stageText(props.locale, locale.disposed));
    };
    navigation.addEventListener("navigate", handleNavigate);
    navigation.addEventListener("currententrychange", handleEntryChange);
    entry.addEventListener("dispose", handleDispose);
    return () => {
      navigation.removeEventListener("navigate", handleNavigate);
      navigation.removeEventListener("currententrychange", handleEntryChange);
      entry.removeEventListener("dispose", handleDispose);
    };
  }, [disposal.solve, props.locale]);

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
        {stageText(props.locale, locale.buildTrail)}
      </button>
      <div
        className="navigation-branch-guide"
        role="img"
        aria-label={stageText(props.locale, locale.navigationBranch)}
      >
        <span data-active={branchRound === 0}>A</span>
        <span aria-hidden="true">→</span>
        <span data-active={branchRound > 0}>B</span>
        <span aria-hidden="true">
          {stageText(props.locale, locale.browserBack)}
        </span>
        <span data-active={branchRound > 0}>C</span>
      </div>
      <p className="measurement">
        {depth === 3 ? stageText(props.locale, locale.useBack) : `${depth} / 3`}
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={createDisposableBranch}
      >
        {branchRound === 0
          ? stageText(props.locale, locale.branchFromB)
          : stageText(props.locale, locale.branchFromA)}
      </button>
      <p className="interaction-status" role="status">
        {navigationStatus}
      </p>
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
        <StageProblemGiftBox box={backForward} locale={props.locale} />
        <StageProblemGiftBox box={reload} locale={props.locale} />
        <StageProblemGiftBox box={disposal} locale={props.locale} />
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

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: HistoryOutlined,
      color: "#fb7185",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: KeyboardReturnOutlined,
      color: "#f59e0b",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: SwapHorizOutlined,
      color: "#fbbf24",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: SwapHorizOutlined,
      color: "#06b6d4",
      label: locale.B04,
    },
  },
  probe: () => "available",
  Component: S220Stage,
});
