import { useEffect, useRef } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

export default function S610Stage(props: StageComponentProps) {
  const button = props.problem("S-610-B01");
  const lightDismiss = props.problem("S-610-B02");
  const cancel = props.problem("S-610-B03");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeKind = useRef<"button" | "dismiss" | "cancel" | undefined>(
    undefined,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.setAttribute("closedby", "any");
    const handleCancel = () => {
      closeKind.current = "cancel";
    };
    const handleClose = () => {
      const kind = closeKind.current;
      if (kind === "button") button.solve(["dialog:button"]);
      if (kind === "dismiss") lightDismiss.solve(["dialog:light-dismiss"]);
      if (kind === "cancel") cancel.solve(["dialog:cancel"]);
      closeKind.current = undefined;
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, [button.solve, cancel.solve, lightDismiss.solve]);

  const open = () => dialogRef.current?.showModal();

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={button} locale={props.locale} />
        <ProblemGiftBox problem={lightDismiss} locale={props.locale} />
        <ProblemGiftBox problem={cancel} locale={props.locale} />
      </div>
      <button type="button" className="stage-action" onClick={open}>
        {props.locale === "ja" ? "dialogを開く" : "Open dialog"}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={props.locale === "ja" ? "閉じ方を試す" : "Try a close path"}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          closeKind.current = "dismiss";
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeKind.current = "cancel";
        }}
      >
        <p>
          <strong>
            {props.locale === "ja" ? "閉じ方を試す" : "Try a close path"}
          </strong>
        </p>
        <p>
          {props.locale === "ja"
            ? "ボタン、外側、Escapeを別々に試す。"
            : "Try the button, outside, and Escape separately."}
        </p>
        <button
          type="button"
          onClick={() => {
            closeKind.current = "button";
            dialogRef.current?.close();
          }}
        >
          {props.locale === "ja" ? "閉じる" : "Close"}
        </button>
      </dialog>
    </div>
  );
}
