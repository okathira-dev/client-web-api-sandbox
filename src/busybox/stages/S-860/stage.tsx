import EditOutlined from "@mui/icons-material/EditOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useCallback, useEffect, useRef, useState } from "react";
import { type Locale, messages, productCopy } from "../../i18n";
import { stageText } from "../locale";
import { locale } from "./locale";

interface ProofLineProps {
  initialText: string;
  className: string;
  as: "h1" | "p";
  label: string;
  onCorrect(value: string): void;
}

function ProofLine({
  initialText,
  className,
  as,
  label,
  onCorrect,
}: ProofLineProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [value, setValue] = useState(initialText);
  const Tag = as;

  useEffect(() => {
    const element = elementRef.current;
    const Edit = window.EditContext;
    if (!element || !Edit) return;
    const context = new Edit({ text: initialText });
    element.editContext = context;
    const update = (event: Event) => {
      const detail = event as EditContextTextUpdateEvent;
      context.updateText(
        detail.updateRangeStart,
        detail.updateRangeEnd,
        detail.text,
      );
      context.updateSelection(
        detail.updateRangeStart + detail.text.length,
        detail.updateRangeStart + detail.text.length,
      );
      const next = context.text;
      setValue(next);
      onCorrect(next);
    };
    context.addEventListener("textupdate", update);
    const updateBounds = () => {
      const rect = element.getBoundingClientRect();
      context.updateControlBounds(rect);
      context.updateSelectionBounds(rect, rect);
      context.updateCharacterBounds(
        0,
        Array.from({ length: Math.max(1, context.text.length) }, () => rect),
      );
    };
    const resizeObserver = new ResizeObserver(updateBounds);
    resizeObserver.observe(element);
    const frame = requestAnimationFrame(updateBounds);
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      context.removeEventListener("textupdate", update);
      if (element.editContext === context) element.editContext = undefined;
    };
  }, [initialText, onCorrect]);

  return (
    <Tag
      ref={elementRef as never}
      className={className}
      tabIndex={0}
      role="textbox"
      aria-label={label}
      aria-multiline="false"
    >
      {value}
    </Tag>
  );
}

function corruptedCopy(locale: Locale) {
  const copy = messages[locale];
  return {
    title: "Busyvox: Web API Explorer",
    subtitle:
      locale === "ja"
        ? "ブラウザそのものが鍵となるパズル。"
        : "A new kind of puzzle where the browser itself is the key.",
    tagline:
      locale === "ja"
        ? "いつものブラウザが、突然パズルになる。"
        : "Your everyday browser suddenly becomes the puzzle.",
    correct: {
      title: productCopy.fullTitle,
      subtitle: copy.subtitle,
      tagline: copy.tagline,
    },
  };
}

/**
 * S-860 — EditContextを通常の見出しと本文へattachし、共通copyの誤字・脱字・余分語を直接直す。
 * 目的: input / textarea / contenteditableではない文章が、IMEやselectionを含むbrowserの編集surfaceになる感覚を体験する。
 * 最初の一手: 題名、説明、コピーの行をクリックまたはTabでfocusし、見えている文章へそのまま入力する。
 * 箱ごとの解法: B01は`Busyvox`を`Busybox`へ、B02はlocaleごとのsubtitleへ欠落した一語を戻し、B03はtaglineから余分な一語を消す。共通product copyと`messages`の完全一致で対応箱が開く。
 * 開かない操作: input、textarea、contenteditable、別の隠しinput、DOM textだけの書換え、synthetic InputEventでは開かない。EditContextの実textupdateだけで状態を更新する。
 * 使用API: EditContext、textupdate、selection、character/control/selection bounds、ResizeObserver。正答copyはAppと共有しstage内へ重複しない。
 * 権限・privacy: 権限、保存、送信は行わない。編集中の文字列はstage memoryにだけ保持し、成功時は既存progressへ事実だけを渡す。
 * cleanup: stage離脱で各HTMLElementからEditContextをdetachし、event listenerとResizeObserverを解除する。
 * 対応環境: `window.EditContext`を提供するbrowser。未対応時はStageHostが操作を要求しない。
 * 人手確認: H-060で日英、keyboard、IME、paste、selection、再入場、通常inputがないことを確認する。
 */
function S860Stage(props: Props) {
  const titleProblem = props.boxes[manifest.box.B01];
  const subtitleProblem = props.boxes[manifest.box.B02];
  const taglineProblem = props.boxes[manifest.box.B03];
  const copy = corruptedCopy(props.locale);
  const correctTitle = useCallback(
    (value: string) => {
      if (value === copy.correct.title) titleProblem.solve();
    },
    [copy.correct.title, titleProblem.solve],
  );
  const correctSubtitle = useCallback(
    (value: string) => {
      if (value === copy.correct.subtitle) subtitleProblem.solve();
    },
    [copy.correct.subtitle, subtitleProblem.solve],
  );
  const correctTagline = useCallback(
    (value: string) => {
      if (value === copy.correct.tagline) taglineProblem.solve();
    },
    [copy.correct.tagline, taglineProblem.solve],
  );

  return (
    <div className="puzzle s860-stage">
      <div className="problem-row">
        <StageProblemGiftBox box={titleProblem} locale={props.locale} />
        <StageProblemGiftBox box={subtitleProblem} locale={props.locale} />
        <StageProblemGiftBox box={taglineProblem} locale={props.locale} />
      </div>
      <p>{stageText(props.locale, locale.intro)}</p>
      <section
        className="s860-proof"
        aria-label={stageText(props.locale, locale.stageName)}
      >
        <ProofLine
          initialText={copy.title}
          className="s860-proof__title"
          as="h1"
          label={stageText(props.locale, locale.B01)}
          onCorrect={correctTitle}
        />
        <ProofLine
          initialText={copy.subtitle}
          className="s860-proof__subtitle"
          as="p"
          label={stageText(props.locale, locale.B02)}
          onCorrect={correctSubtitle}
        />
        <ProofLine
          initialText={copy.tagline}
          className="s860-proof__tagline"
          as="p"
          label={stageText(props.locale, locale.B03)}
          onCorrect={correctTagline}
        />
      </section>
      <small>{stageText(props.locale, locale.focusHint)}</small>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: EditOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: EditOutlined,
      color: "#f59e0b",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: EditOutlined,
      color: "#d97706",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      window.EditContext ? "available" : "unsupported",
    ),
  Component: S860Stage,
});
