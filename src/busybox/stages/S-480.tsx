import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-480 — classify browser preferred default text size into four stable bands. H-003/H-004/H-023. */
export default function S480Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-480-B01"),
    props.problem("S-480-B02"),
    props.problem("S-480-B03"),
    props.problem("S-480-B04"),
  ] as const;
  const [solveSmall, solveStandard, solveLarge, solveExtraLarge] = problems.map(
    (problem) => problem.solve,
  );
  const [size, setSize] = useState(0);
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
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{size.toFixed(1)}px</p>
    </div>
  );
}
