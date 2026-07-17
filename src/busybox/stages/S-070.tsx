import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/**
 * S-070
 *
 * Gimmick: Network absence becomes a valid browser state rather than an error.
 * Uses: navigator.onLine, online/offline events, and the installed Service Worker.
 * Success: Observe navigator.onLine becoming false.
 * Privacy/Permission: No permission; network contents are never inspected.
 * Cleanup: Remove online and offline listeners on unmount.
 * Human verification: H-005, H-021, H-022
 */
export default function S070Stage(props: StageComponentProps) {
  const problem = props.problem("S-070-B01");
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const observe = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) problem.solve(["offline"]);
    };
    window.addEventListener("online", observe);
    window.addEventListener("offline", observe);
    observe();
    return () => {
      window.removeEventListener("online", observe);
      window.removeEventListener("offline", observe);
    };
  }, [problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <div
        className={`signal-clue ${online ? "" : "signal-clue--offline"}`}
        aria-hidden="true"
      >
        ⌁
      </div>
      <p role="status">{online ? "•••" : "×"}</p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
