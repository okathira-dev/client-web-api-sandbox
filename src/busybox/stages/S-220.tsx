import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s220Locale } from "./S-220.locale";

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
/**
 * S-220
 *
 * 目的: S-220の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
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
      setNavigationStatus(stageText(props.locale, s220Locale.unavailable));
      return;
    }
    let branchCreated = false;
    const handleNavigate = () => {
      branchCreated = true;
      setNavigationStatus(stageText(props.locale, s220Locale.nativeNavigate));
    };
    const handleEntryChange = () => {
      setNavigationStatus(
        `${stageText(props.locale, s220Locale.currentEntry)}${String(navigation.canGoForward)}`,
      );
    };
    const handleDispose = () => {
      if (!branchCreated) return;
      disposal.solve(["navigation:entry-dispose"]);
      setNavigationStatus(stageText(props.locale, s220Locale.disposed));
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
        {stageText(props.locale, s220Locale.buildTrail)}
      </button>
      <div
        className="navigation-branch-guide"
        role="img"
        aria-label={stageText(props.locale, s220Locale.navigationBranch)}
      >
        <span data-active={branchRound === 0}>A</span>
        <span aria-hidden="true">→</span>
        <span data-active={branchRound > 0}>B</span>
        <span aria-hidden="true">
          {stageText(props.locale, s220Locale.browserBack)}
        </span>
        <span data-active={branchRound > 0}>C</span>
      </div>
      <p className="measurement">
        {depth === 3
          ? stageText(props.locale, s220Locale.useBack)
          : `${depth} / 3`}
      </p>
      <button
        type="button"
        className="stage-action"
        onClick={createDisposableBranch}
      >
        {branchRound === 0
          ? stageText(props.locale, s220Locale.branchFromB)
          : stageText(props.locale, s220Locale.branchFromA)}
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
