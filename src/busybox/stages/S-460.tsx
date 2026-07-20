import { useEffect, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-460 — click the no-drag box while it is physically inside the visible Window Controls Overlay rect. H-005/H-019/H-023. */
export default function S460Stage(props: StageComponentProps) {
  const problem = props.problem("S-460-B01");
  const [visible, setVisible] = useState(false);
  const overlay = navigator.windowControlsOverlay;
  useEffect(() => {
    const inspect = () => setVisible(Boolean(overlay?.visible));
    inspect();
    overlay?.addEventListener("geometrychange", inspect);
    return () => overlay?.removeEventListener("geometrychange", inspect);
  }, []);
  return (
    <div className="puzzle puzzle--centered">
      <div className="overlay-box">
        <ProblemGiftBox
          problem={problem}
          locale={props.locale}
          onClick={(event) => {
            if (!overlay?.visible) return;
            const rect = overlay.getTitlebarAreaRect();
            if (
              event.clientX >= rect.left &&
              event.clientX <= rect.right &&
              event.clientY >= rect.top &&
              event.clientY <= rect.bottom
            )
              problem.solve(["window-controls-overlay:inside"]);
          }}
        />
      </div>
      <p role="status">{visible ? "overlay" : "window"}</p>
    </div>
  );
}
