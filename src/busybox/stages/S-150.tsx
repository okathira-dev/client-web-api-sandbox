import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const visualOrder = { A: 1, B: 2, C: 3 } as const;

/**
 * S-150
 *
 * Gimmick: Keep the visual order fixed while rotating the underlying DOM order.
 * Uses: CSS order, DOM child order, and MutationObserver.
 * Success: The actual child text becomes ABC even though the visible strip stays ABC.
 * Privacy/Permission: No permission or retained document content.
 * Cleanup: Disconnect the MutationObserver on unmount.
 * Human verification: H-001, H-020, H-025
 */
export default function S150Stage(props: StageComponentProps) {
  const problem = props.problem("S-150-B01");
  const focusProblem = props.problem("S-150-B02");
  const detailsProblem = props.problem("S-150-B03");
  const [order, setOrder] = useState<readonly (keyof typeof visualOrder)[]>([
    "B",
    "C",
    "A",
  ]);
  const structureRef = useRef<HTMLOListElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const detailToggleCount = useRef(0);

  useEffect(() => {
    const structure = structureRef.current;
    if (!structure) return;
    const inspect = () => {
      const text = Array.from(
        structure.children,
        (item) => item.textContent,
      ).join("");
      if (text === "ABC") problem.solve(["dom:ordered"]);
    };
    const observer = new MutationObserver(inspect);
    observer.observe(structure, { childList: true });
    inspect();
    return () => observer.disconnect();
  }, [problem.solve]);

  useEffect(() => {
    const container = detailsRef.current;
    if (!container) return;
    const details = Array.from(container.querySelectorAll("details"));
    const inspect = () => {
      detailToggleCount.current += 1;
      const openCount = details.filter((item) => item.open).length;
      if (detailToggleCount.current > 1 && openCount === 1)
        detailsProblem.solve(["details:exclusive-toggle"]);
    };
    details.forEach((item) => {
      item.addEventListener("toggle", inspect);
    });
    return () => {
      details.forEach((item) => {
        item.removeEventListener("toggle", inspect);
      });
    };
  }, [detailsProblem.solve]);

  const rotate = () => {
    setOrder(([first, ...rest]) => (first ? [...rest, first] : []));
  };

  return (
    <div className="puzzle puzzle--centered">
      <ol className="structure-strip" ref={structureRef} aria-label="DOM order">
        {order.map((token) => (
          <li key={token} style={{ order: visualOrder[token] }}>
            {token}
          </li>
        ))}
      </ol>
      <p className="measurement">
        {props.locale === "ja"
          ? "見た目は動かない。読む順番だけが動く。"
          : "The view stays still. Only reading order moves."}
      </p>
      <button type="button" className="stage-action" onClick={rotate}>
        {props.locale === "ja" ? "文書を回す" : "Rotate document"}
      </button>
      <button
        type="button"
        className="stage-action"
        onFocus={() => focusProblem.solve(["focus:native"])}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clipPath: "inset(50%)",
        }}
      >
        {props.locale === "ja" ? "不可視focus" : "Hidden focus"}
      </button>
      <div ref={detailsRef}>
        {(["A", "B", "C"] as const).map((name) => (
          <details key={name} name="busybox-exclusive-details">
            <summary>{name}</summary>
            <p>{name}</p>
          </details>
        ))}
      </div>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={focusProblem} locale={props.locale} />
        <ProblemGiftBox problem={detailsProblem} locale={props.locale} />
      </div>
    </div>
  );
}
