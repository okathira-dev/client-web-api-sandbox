import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * S-080
 *
 * Gimmick: PWA display mode changes the entry context.
 * Uses: matchMedia with display-mode: standalone.
 * Success: Observe display-mode: standalone from an installed launch.
 * Privacy/Permission: No permission; only the display-mode fact is retained.
 * Cleanup: Remove the media-query listener on unmount.
 * Human verification: H-005, H-023, H-025
 */
export default function S080Stage(props: StageComponentProps) {
  const problem = props.problem("S-080-B01");
  const [standalone, setStandalone] = useState(isStandalone);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const observe = () => {
      setStandalone(media.matches);
      if (media.matches) problem.solve(["display-mode:standalone"]);
    };
    media.addEventListener("change", observe);
    observe();
    return () => media.removeEventListener("change", observe);
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`door-clue ${standalone ? "door-clue--open" : ""}`}
        aria-hidden="true"
      >
        ▯
      </div>
      <p>{props.locale === "ja" ? "別の入口から。" : "Enter another way."}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
