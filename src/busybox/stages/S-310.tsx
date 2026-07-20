import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

interface LaunchParamsLike {
  targetURL?: string;
}

interface LaunchQueueLike {
  setConsumer(consumer: (params: LaunchParamsLike) => void): void;
}

/**
 * S-310
 *
 * Gimmick: Re-enter the installed PWA through a URL delivered to its launch queue.
 * Uses: launchQueue consumer and a stage-scoped target URL.
 * Success: Consume a target URL carrying both the S-310 stage and busybox launch marker.
 * Privacy/Permission: No permission; inspect only the two expected URL parameters.
 * Cleanup: Disable the non-removable launch consumer callback when the stage unmounts.
 * Human verification: H-005, H-021, H-023, H-025
 */
export default function S310Stage(props: StageComponentProps) {
  const problem = props.problem("S-310-B01");
  const shortcut = props.problem("S-310-B02");
  const note = props.problem("S-310-B03");
  const [status, setStatus] = useState("waiting");
  const targetUrl = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("stage", "S-310");
    url.searchParams.set("launch", "busybox");
    return url.href;
  }, []);

  useEffect(() => {
    let active = true;
    const inspect = (target: string) => {
      const url = new URL(target, location.href);
      const source = url.searchParams.get("source");
      if (source === "shortcut") shortcut.solve(["pwa:shortcut"]);
      if (source === "note") note.solve(["pwa:note-taking"]);
      if (
        url.searchParams.get("stage") === "S-310" &&
        url.searchParams.get("launch") === "busybox"
      ) {
        setStatus("launched");
        problem.solve(["launch-handler:target-url"]);
      }
    };
    inspect(location.href);
    const queue = (
      window as unknown as Window & { launchQueue: LaunchQueueLike }
    ).launchQueue;
    queue.setConsumer((params) => {
      if (!active || !params.targetURL) return;
      inspect(params.targetURL);
    });
    return () => {
      active = false;
    };
  }, [note.solve, problem.solve, shortcut.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <p className="measurement">
        {props.locale === "ja"
          ? "インストールしたBusyboxへ、このURLからもう一度入る。"
          : "Open this URL into the installed Busybox again."}
      </p>
      <a className="stage-action" href={targetUrl}>
        {props.locale === "ja" ? "起動用URL" : "Launch URL"}
      </a>
      <p className="launch-url">{targetUrl}</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <div className="problem-row">
        <ProblemGiftBox problem={problem} locale={props.locale} />
        <ProblemGiftBox problem={shortcut} locale={props.locale} />
        <ProblemGiftBox problem={note} locale={props.locale} />
      </div>
    </div>
  );
}
