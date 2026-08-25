import AspectRatioOutlined from "@mui/icons-material/AspectRatioOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import PauseOutlined from "@mui/icons-material/PauseOutlined";
import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import SignalWifiOffOutlined from "@mui/icons-material/SignalWifiOffOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useMemo, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

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
    boxId: manifest.box.B05,
    value: "dark",
    query: "(prefers-color-scheme: dark)",
    label: "colorSchemeAction",
  },
  {
    key: "contrast",
    boxId: manifest.box.B06,
    value: "more",
    query: "(prefers-contrast: more)",
    label: "contrastAction",
  },
  {
    key: "reducedMotion",
    boxId: manifest.box.B07,
    value: "reduce",
    query: "(prefers-reduced-motion: reduce)",
    label: "motionAction",
  },
  {
    key: "reducedTransparency",
    boxId: manifest.box.B08,
    value: "reduce",
    query: "(prefers-reduced-transparency: reduce)",
    label: "transparencyAction",
  },
  {
    key: "reducedData",
    boxId: manifest.box.B09,
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
function S480Stage(props: Props) {
  const textProblems = [
    props.boxes[manifest.box.B01],
    props.boxes[manifest.box.B02],
    props.boxes[manifest.box.B03],
    props.boxes[manifest.box.B04],
  ] as const;
  const [solveSmall, solveStandard, solveLarge, solveExtraLarge] =
    textProblems.map((problem) => problem.solve);
  const preferenceProblems = preferenceDefinitions.map((definition) => ({
    definition,
    problem: props.boxes[definition.boxId],
  }));
  const [size, setSize] = useState(0);
  const [status, setStatus] = useState(() =>
    stageText(props.locale, locale.preferenceIdle),
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
      if (band === 0) solveSmall?.();
      if (band === 1) solveStandard?.();
      if (band === 2) solveLarge?.();
      if (band === 3) solveExtraLarge?.();
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
      setStatus(stageText(props.locale, locale.preferenceUnavailable));
      return;
    }
    if (!preference.validValues.includes(definition.value)) {
      setStatus(stageText(props.locale, locale.preferenceInvalid));
      return;
    }
    try {
      await preference.requestOverride(definition.value);
      const effective = window.matchMedia(definition.query).matches;
      const reported =
        preference.override === definition.value ||
        preference.value === definition.value;
      if (effective && reported) {
        problem.solve();
        setStatus(stageText(props.locale, locale.preferenceApplied));
      } else {
        setStatus(stageText(props.locale, locale.preferenceNotEffective));
      }
    } catch {
      setStatus(stageText(props.locale, locale.preferenceRejected));
    }
  };

  const clearPreferences = () => {
    for (const definition of preferenceDefinitions) {
      preferences?.[definition.key]?.clearOverride();
    }
    setStatus(stageText(props.locale, locale.preferenceCleared));
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {textProblems.map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{size.toFixed(1)}px</p>
      <div className="problem-row">
        {preferenceProblems.map(({ problem }) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <div className="stage-action-row">
        {preferenceProblems.map((item) => (
          <button
            key={item.problem.id}
            type="button"
            className="stage-action"
            disabled={!preferences?.[item.definition.key]}
            onClick={() => void requestPreference(item)}
          >
            {stageText(props.locale, locale[item.definition.label])}
          </button>
        ))}
        <button
          type="button"
          className="stage-action"
          onClick={clearPreferences}
        >
          {stageText(props.locale, locale.clearPreferences)}
        </button>
      </div>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: AspectRatioOutlined,
      color: "#60a5fa",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: AspectRatioOutlined,
      color: "#34d399",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: AspectRatioOutlined,
      color: "#fbbf24",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: AspectRatioOutlined,
      color: "#fb7185",
      label: locale.B04,
    },
    [manifest.box.B05]: {
      icon: LightModeOutlined,
      color: "#312e81",
      label: locale.B05,
    },
    [manifest.box.B06]: {
      icon: SelectAllOutlined,
      color: "#f8fafc",
      label: locale.B06,
    },
    [manifest.box.B07]: {
      icon: PauseOutlined,
      color: "#22c55e",
      label: locale.B07,
    },
    [manifest.box.B08]: {
      icon: VisibilityOffOutlined,
      color: "#94a3b8",
      label: locale.B08,
    },
    [manifest.box.B09]: {
      icon: SignalWifiOffOutlined,
      color: "#38bdf8",
      label: locale.B09,
    },
  },
  probe: () => "available",
  Component: S480Stage,
});
