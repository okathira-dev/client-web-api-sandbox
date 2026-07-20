import { useEffect, useMemo, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const key = "busybox:S-440:round";
/** S-440 — download a .busybox payload, then consume its real FileSystemFileHandle through LaunchQueue. H-005/H-006/H-021/H-023. */
export default function S440Stage(props: StageComponentProps) {
  const problem = props.problem("S-440-B01");
  const round = useMemo(() => crypto.randomUUID(), []);
  const [status, setStatus] = useState("waiting");
  useEffect(() => {
    let active = true;
    window.launchQueue?.setConsumer(async (params) => {
      const handle = params.files[0];
      if (!active || !handle) return;
      try {
        const file = await handle.getFile();
        const payload = JSON.parse(await file.text()) as { round?: string };
        if (payload.round && payload.round === localStorage.getItem(key)) {
          problem.solve(["file-handler:busybox"]);
          setStatus(file.name);
        }
      } catch {
        setStatus("invalid");
      }
    });
    return () => {
      active = false;
    };
  }, [problem.solve]);
  const download = () => {
    localStorage.setItem(key, round);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ kind: "busybox", round })], {
        type: "application/x-busybox",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${round}.busybox`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus("downloaded");
  };
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <button type="button" className="stage-action" onClick={download}>
        {props.locale === "ja" ? ".busyboxを保存" : "Save .busybox"}
      </button>
      <p role="status">{status}</p>
    </div>
  );
}
