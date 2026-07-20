import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-370 — real BatteryManager charging changes and 75% bands. H-004/H-019/H-023. */
export default function S370Stage(props: StageComponentProps) {
  const plugged = props.problem("S-370-B01");
  const unplugged = props.problem("S-370-B02");
  const high = props.problem("S-370-B03");
  const low = props.problem("S-370-B04");
  const [status, setStatus] = useState("…");
  useEffect(() => {
    let battery: BatteryManager | undefined;
    const inspectLevel = () => {
      if (!battery) return;
      setStatus(`${Math.round(battery.level * 100)}%`);
      if (battery.level >= 0.75) high.solve(["battery:high"]);
      else low.solve(["battery:low"]);
    };
    const inspectCharging = () => {
      if (!battery) return;
      if (battery.charging) plugged.solve(["battery:plugged"]);
      else unplugged.solve(["battery:unplugged"]);
    };
    void navigator.getBattery?.().then((manager) => {
      if (props.signal.aborted) return;
      battery = manager;
      inspectLevel();
      battery.addEventListener("levelchange", inspectLevel);
      battery.addEventListener("chargingchange", inspectCharging);
    });
    return () => {
      battery?.removeEventListener("levelchange", inspectLevel);
      battery?.removeEventListener("chargingchange", inspectCharging);
    };
  }, [high.solve, low.solve, plugged.solve, props.signal, unplugged.solve]);
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {[plugged, unplugged, high, low].map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <p className="measurement">{status}</p>
    </div>
  );
}
