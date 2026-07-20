import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const key = "busybox:S-450:round";
/** S-450 — launch the installed PWA through web+busybox and consume its armed nonce. H-005/H-006/H-021/H-023. */
export default function S450Stage(props: StageComponentProps) {
  const problem = props.problem("S-450-B01");
  const round = useMemo(() => crypto.randomUUID(), []);
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    const inspect = (target: string) => {
      const outer = new URL(target, location.href);
      const protocol = outer.searchParams.get("protocol");
      if (!protocol) return;
      const value = decodeURIComponent(protocol);
      if (value === `web+busybox:open?round=${localStorage.getItem(key)}`) {
        problem.solve(["protocol-handler:launch"]);
        setStatus("launched");
      }
    };
    inspect(location.href);
    let active = true;
    window.launchQueue?.setConsumer((params) => {
      if (active) inspect(params.targetURL);
    });
    return () => {
      active = false;
    };
  }, [problem.solve]);
  const arm = () => {
    localStorage.setItem(key, round);
    location.href = `web+busybox:open?round=${round}`;
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button type="button" className="stage-action" onClick={arm}>
        {props.locale === "ja" ? "専用の合図を送る" : "Send the private signal"}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
