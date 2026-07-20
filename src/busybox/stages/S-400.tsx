import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-400 — compare wall-clock movement with monotonic time: -60±5 minutes, then restore baseline. H-004/H-019/H-022. */
export default function S400Stage(props: StageComponentProps) {
  const rewind = props.problem("S-400-B01");
  const restore = props.problem("S-400-B02");
  const baseline = useRef({ wall: Date.now(), monotonic: performance.now() });
  const rewound = useRef(false);
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const inspect = () => {
      const expected =
        baseline.current.wall +
        (performance.now() - baseline.current.monotonic);
      const minutes = (Date.now() - expected) / 60000;
      setOffset(minutes);
      if (minutes >= -65 && minutes <= -55) {
        rewound.current = true;
        rewind.solve(["clock:minus-one-hour"]);
      }
      if (rewound.current && Math.abs(minutes) <= 5)
        restore.solve(["clock:restored"]);
    };
    inspect();
    const timer = window.setInterval(inspect, 1000);
    return () => window.clearInterval(timer);
  }, [restore.solve, rewind.solve]);
  const display = new Date(Date.now() - 60 * 60 * 1000);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={rewind} locale={props.locale} />
        <ProblemGiftBox problem={restore} locale={props.locale} />
      </div>
      <time className="analog-clock" dateTime={display.toISOString()}>
        {display.toLocaleTimeString(props.locale, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </time>
      <p className="measurement">{offset.toFixed(1)} min</p>
    </div>
  );
}
