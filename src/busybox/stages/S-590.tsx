import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

interface Anchor {
  latitude: number;
  longitude: number;
  accuracy: number;
  at: number;
}
const anchorKey = "busybox:S-590:anchor";
function distance(a: Anchor, b: GeolocationCoordinates) {
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** S-590 — conservative 5/25/100m distance from a session-only, 24h start anchor. H-004/H-006/H-028. */
export default function S590Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-590-B01"),
    props.problem("S-590-B02"),
    props.problem("S-590-B03"),
  ] as const;
  const [solveFive, solveTwentyFive, solveHundred] = problems.map(
    (problem) => problem.solve,
  );
  const [meters, setMeters] = useState(0);
  useEffect(() => {
    let anchor: Anchor | null = null;
    try {
      const stored = JSON.parse(
        sessionStorage.getItem(anchorKey) ?? "null",
      ) as Anchor | null;
      if (stored && Date.now() - stored.at < 86400000) anchor = stored;
    } catch {
      sessionStorage.removeItem(anchorKey);
    }
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        if (!anchor) {
          anchor = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            at: Date.now(),
          };
          sessionStorage.setItem(anchorKey, JSON.stringify(anchor));
          return;
        }
        const conservative = Math.max(
          0,
          distance(anchor, position.coords) -
            anchor.accuracy -
            position.coords.accuracy,
        );
        setMeters(conservative);
        if (conservative >= 5) solveFive?.(["distance:5m"]);
        if (conservative >= 25) solveTwentyFive?.(["distance:25m"]);
        if (conservative >= 100) {
          solveHundred?.(["distance:100m"]);
          sessionStorage.removeItem(anchorKey);
        }
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [solveFive, solveHundred, solveTwentyFive]);
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
      <p className="measurement">{meters.toFixed(1)}m</p>
    </div>
  );
}
