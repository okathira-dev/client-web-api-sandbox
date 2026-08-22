import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s480Locale } from "./S-480.locale";

type PreferenceKey =
  | "colorScheme"
  | "contrast"
  | "reducedMotion"
  | "reducedTransparency"
  | "reducedData";

type PreferenceObjectLike = EventTarget & {
  readonly value: string;
  readonly override: string | null;
  readonly validValues: readonly string[];
  requestOverride(value: string): Promise<void>;
  clearOverride(): void;
};

type PreferenceManagerLike = Partial<
  Readonly<Record<PreferenceKey, PreferenceObjectLike>>
>;

const preferenceDefinitions = [
  {
    key: "colorScheme",
    problemId: "S-480-B05",
    value: "dark",
    query: "(prefers-color-scheme: dark)",
    label: "colorSchemeAction",
  },
  {
    key: "contrast",
    problemId: "S-480-B06",
    value: "more",
    query: "(prefers-contrast: more)",
    label: "contrastAction",
  },
  {
    key: "reducedMotion",
    problemId: "S-480-B07",
    value: "reduce",
    query: "(prefers-reduced-motion: reduce)",
    label: "motionAction",
  },
  {
    key: "reducedTransparency",
    problemId: "S-480-B08",
    value: "reduce",
    query: "(prefers-reduced-transparency: reduce)",
    label: "transparencyAction",
  },
  {
    key: "reducedData",
    problemId: "S-480-B09",
    value: "reduce",
    query: "(prefers-reduced-data: reduce)",
    label: "dataAction",
  },
] as const;

/**
 * S-480
 *
 * 目的: browser既定文字サイズの4帯と、User Preferences APIが実際に上書きした5種類の`prefers-*`状態を別々の箱で観測する。
 * 最初の一手: 上段はbrowserの既定文字サイズを変更し、下段は各設定buttonからbrowser所有のoverride要求を開始する。
 * 箱ごとの解法: B01〜B04は隠した1rem probeの実computed font-sizeが各帯へ入ると開く。B05〜B09は対応`requestOverride()`が成功し、PreferenceObjectの`override`または`value`と実`matchMedia()`が要求値へ一致した時だけ開く。
 * 開かない操作: page zoom、CSS class、合成media-query event、API欠損時の独自toggle、別設定のoverride、request失敗では開かない。
 * 使用API: CSS Fonts、getComputedStyle、ResizeObserver、User Preferences API、matchMedia。
 * 権限・privacy: preference値は現在のstage内で照合するだけで保存・同期・送信しない。override要求はplayerの明示buttonからだけ行う。
 * cleanup: clear button、stage離脱、abortでこのstageが設定した全overrideを`clearOverride()`し、observerを解除してprobeを削除する。
 * 対応環境: B01〜B04はResizeObserver対応browser。B05〜B09は`navigator.preferences`と対応PreferenceObjectを公開するbrowserだけで操作可能にする。
 * 人手確認: H-003/H-004/H-019/H-020/H-023/H-025で各overrideのnative UI、実media query、拒否、clear、再入場を確認する。
 */
export default function S480Stage(props: StageComponentProps) {
  const textProblems = [
    props.problem("S-480-B01"),
    props.problem("S-480-B02"),
    props.problem("S-480-B03"),
    props.problem("S-480-B04"),
  ] as const;
  const [solveSmall, solveStandard, solveLarge, solveExtraLarge] =
    textProblems.map((problem) => problem.solve);
  const preferenceProblems = preferenceDefinitions.map((definition) => ({
    definition,
    problem: props.problem(definition.problemId),
  }));
  const [size, setSize] = useState(0);
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s480Locale.preferenceIdle),
  );
  const preferences = useMemo(
    () =>
      (navigator as Navigator & { preferences?: PreferenceManagerLike })
        .preferences,
    [],
  );

  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;visibility:hidden;font-size:1rem;line-height:1";
    probe.textContent = "M";
    document.body.append(probe);
    const inspect = () => {
      const pixels = Number.parseFloat(getComputedStyle(probe).fontSize);
      setSize(pixels);
      const band = pixels < 15 ? 0 : pixels < 18 ? 1 : pixels < 22 ? 2 : 3;
      if (band === 0) solveSmall?.(["text-scale:band-1"]);
      if (band === 1) solveStandard?.(["text-scale:band-2"]);
      if (band === 2) solveLarge?.(["text-scale:band-3"]);
      if (band === 3) solveExtraLarge?.(["text-scale:band-4"]);
    };
    inspect();
    const observer = new ResizeObserver(inspect);
    observer.observe(probe);
    return () => {
      observer.disconnect();
      probe.remove();
    };
  }, [solveExtraLarge, solveLarge, solveSmall, solveStandard]);

  useEffect(() => {
    const clear = () => {
      for (const definition of preferenceDefinitions) {
        preferences?.[definition.key]?.clearOverride();
      }
    };
    props.signal.addEventListener("abort", clear, { once: true });
    return () => {
      props.signal.removeEventListener("abort", clear);
      clear();
    };
  }, [preferences, props.signal]);

  const requestPreference = async (
    item: (typeof preferenceProblems)[number],
  ) => {
    const { definition, problem } = item;
    const preference = preferences?.[definition.key];
    if (!preference) {
      setStatus(stageText(props.locale, s480Locale.preferenceUnavailable));
      return;
    }
    if (!preference.validValues.includes(definition.value)) {
      setStatus(stageText(props.locale, s480Locale.preferenceInvalid));
      return;
    }
    try {
      await preference.requestOverride(definition.value);
      const effective = window.matchMedia(definition.query).matches;
      const reported =
        preference.override === definition.value ||
        preference.value === definition.value;
      if (effective && reported) {
        problem.solve([
          `preference:${definition.key}`,
          `value:${definition.value}`,
        ]);
        setStatus(stageText(props.locale, s480Locale.preferenceApplied));
      } else {
        setStatus(stageText(props.locale, s480Locale.preferenceNotEffective));
      }
    } catch {
      setStatus(stageText(props.locale, s480Locale.preferenceRejected));
    }
  };

  const clearPreferences = () => {
    for (const definition of preferenceDefinitions) {
      preferences?.[definition.key]?.clearOverride();
    }
    setStatus(stageText(props.locale, s480Locale.preferenceCleared));
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {textProblems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{size.toFixed(1)}px</p>
      <div className="problem-row">
        {preferenceProblems.map(({ problem }) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <div className="stage-action-row">
        {preferenceProblems.map((item) => (
          <button
            key={item.problem.definition.id}
            type="button"
            className="stage-action"
            disabled={!preferences?.[item.definition.key]}
            onClick={() => void requestPreference(item)}
          >
            {stageText(props.locale, s480Locale[item.definition.label])}
          </button>
        ))}
        <button
          type="button"
          className="stage-action"
          onClick={clearPreferences}
        >
          {stageText(props.locale, s480Locale.clearPreferences)}
        </button>
      </div>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
