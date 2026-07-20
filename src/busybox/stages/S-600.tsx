import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-600 — altitude uncertainty interval must remain inside one of three bands for three readings and five seconds. H-004/H-006/H-029. */
export default function S600Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-600-B01"),
    props.problem("S-600-B02"),
    props.problem("S-600-B03"),
  ] as const;
  const [solveLow, solveMiddle, solveHigh] = problems.map(
    (problem) => problem.solve,
  );
  const stable = useRef({ band: -1, count: 0, since: 0 });
  const [altitude, setAltitude] = useState<number | null>(null);
  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        const value = position.coords.altitude;
        const accuracy = position.coords.altitudeAccuracy;
        if (value === null || accuracy === null) return;
        setAltitude(value);
        const low = value - accuracy;
        const high = value + accuracy;
        const band =
          high < 100 ? 0 : low >= 100 && high < 500 ? 1 : low >= 500 ? 2 : -1;
        if (band < 0) {
          stable.current = { band: -1, count: 0, since: 0 };
          return;
        }
        if (stable.current.band !== band)
          stable.current = { band, count: 1, since: performance.now() };
        else stable.current.count += 1;
        if (
          stable.current.count >= 3 &&
          performance.now() - stable.current.since >= 5000
        )
          if (band === 0) solveLow?.(["altitude:band-1"]);
          else if (band === 1) solveMiddle?.(["altitude:band-2"]);
          else solveHigh?.(["altitude:band-3"]);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [solveHigh, solveLow, solveMiddle]);
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
      <p className="measurement">
        {altitude === null ? "…" : `${altitude.toFixed(1)}m`}
      </p>
    </div>
  );
}
