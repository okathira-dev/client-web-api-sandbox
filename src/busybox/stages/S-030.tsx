import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-030
 *
 * Gimmick: A DOM Selection, rather than a form value, carries the answer.
 * Uses: Selection API and selectionchange.
 * Success: Select the localized word rendered between brackets.
 * Privacy/Permission: No permission; selected text is not retained.
 * Cleanup: Remove selectionchange listeners on unmount or stage abort.
 * Human verification: H-001, H-003, H-020, H-025
 */
export default function S030Stage(props: StageComponentProps) {
  const answer = props.locale === "ja" ? "あいだ" : "between";
  const problem = props.problem("S-030-B01");
  const highlightProblem = props.problem("S-030-B02");
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [highlightCount, setHighlightCount] = useState(0);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const observeSelection = () => {
      if (document.getSelection()?.toString().trim().toLowerCase() === answer) {
        problem.solve(["selection"]);
      }
    };
    document.addEventListener("selectionchange", observeSelection);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("selectionchange", observeSelection),
      { once: true },
    );
    return () =>
      document.removeEventListener("selectionchange", observeSelection);
  }, [answer, problem.solve, props.signal]);

  useEffect(() => {
    const paragraph = paragraphRef.current;
    const css = window.CSS;
    const registry = (
      css as
        | (typeof CSS & {
            highlights?: Map<string, HighlightLike>;
          })
        | undefined
    )?.highlights;
    const HighlightConstructor = (
      window as unknown as {
        Highlight?: HighlightConstructorLike;
      }
    ).Highlight;
    if (!paragraph || !registry || !HighlightConstructor) {
      setStatus("Custom Highlight is unavailable");
      return;
    }
    const textNode = paragraph.firstChild;
    if (!textNode) return;
    const fragments =
      props.locale === "ja"
        ? ["ひかり", "あいだ", "しるし"]
        : ["amber", "between", "signal"];
    const ranges: Range[] = [];
    const key = `busybox-s030-${crypto.randomUUID()}`;
    const handleSelection = () => {
      const selection = document.getSelection();
      if (selection?.rangeCount !== 1) return;
      const current = selection.getRangeAt(0);
      if (
        current.startContainer !== textNode ||
        current.endContainer !== textNode
      )
        return;
      const expected = fragments[ranges.length];
      if (!expected || current.toString() !== expected) return;
      const clone = current.cloneRange();
      ranges.push(clone);
      registry.set(key, new HighlightConstructor(...ranges));
      setHighlightCount(ranges.length);
      setStatus(`${ranges.length} / ${fragments.length}`);
      if (ranges.length === fragments.length)
        highlightProblem.solve(["css-highlight:three-ranges"]);
    };
    document.addEventListener("selectionchange", handleSelection);
    props.signal.addEventListener("abort", () => registry.delete(key), {
      once: true,
    });
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      registry.delete(key);
    };
  }, [highlightProblem.solve, props.locale, props.signal]);

  return (
    <div className="puzzle puzzle--centered selection-puzzle">
      <p>
        [ <strong>{answer}</strong> ]
      </p>
      <p ref={paragraphRef}>
        {props.locale === "ja"
          ? "ひかりのあいだにしるしを3つ選ぶ。"
          : "amber between signal amber between signal"}
      </p>
      <p className="measurement">{highlightCount} / 3</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={highlightProblem} locale={props.locale} />
      </div>
    </div>
  );
}

interface HighlightLike {
  add(range: Range): void;
}

interface HighlightConstructorLike {
  new (...ranges: Range[]): HighlightLike;
}
