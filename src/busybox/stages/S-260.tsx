import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

type PeripheralStatus = "idle" | "read" | "cancelled" | "unavailable";

interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}

interface EyeDropperWindow extends Window {
  EyeDropper: new () => EyeDropperInstance;
}

const EYEDROPPER_TARGET = "#a78bfa";

/**
 * S-260
 *
 * Gimmick: Pick the exact purple rendered by the stage from anywhere on screen.
 * Uses: EyeDropper API with the stage AbortSignal.
 * Success: The normalized sRGB result equals #a78bfa.
 * Privacy/Permission: Open the picker only from an action; retain only the chosen hex value.
 * Cleanup: Abort an open picker automatically when the stage exits.
 * Human verification: H-012, H-020, H-030
 */
export default function S260Stage(props: StageComponentProps) {
  const problem = props.problem("S-260-B01");
  const [picked, setPicked] = useState("—");
  const [status, setStatus] = useState<PeripheralStatus>("idle");

  const pick = async () => {
    try {
      const EyeDropperApi = (window as unknown as EyeDropperWindow).EyeDropper;
      const result = await new EyeDropperApi().open({ signal: props.signal });
      const normalized = result.sRGBHex.toLowerCase();
      setPicked(normalized);
      setStatus("read");
      if (normalized === EYEDROPPER_TARGET) {
        problem.solve(["eyedropper:target-color"]);
      }
    } catch (error) {
      setStatus(
        error instanceof DOMException && error.name === "AbortError"
          ? "cancelled"
          : "unavailable",
      );
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <button
        type="button"
        className="eyedropper-target"
        style={{ background: EYEDROPPER_TARGET }}
        onClick={() => void pick()}
        aria-label={
          props.locale === "ja"
            ? "紫色から色を採る"
            : "Pick from the purple color"
        }
      />
      <button
        type="button"
        className="stage-action"
        onClick={() => void pick()}
      >
        {props.locale === "ja"
          ? "画面から一滴採る"
          : "Pick a drop from the screen"}
      </button>
      <p className="measurement">{picked}</p>
      <p className="interaction-status" role="status">
        {status}
      </p>
      <ProblemGiftBox problem={problem} locale={props.locale} />
    </div>
  );
}
