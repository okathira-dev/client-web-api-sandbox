import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const plain = "follow the quiet marks until busybox appears between the noise";
const cipher = plain.replace(/[a-z]/g, (letter) =>
  String.fromCharCode(((letter.charCodeAt(0) - 97 + 3) % 26) + 97),
);

/** S-500 — copy Caesar text, trusted-paste the substituted plaintext, then select busybox. H-004/H-006/H-014. */
export default function S500Stage(props: StageComponentProps) {
  const problem = props.problem("S-500-B01");
  const targetRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    const inspect = () => {
      const selection = document.getSelection();
      if (
        !copied ||
        !pasted ||
        !selection ||
        selection.toString() !== "busybox"
      )
        return;
      const node = selection.anchorNode;
      if (node && targetRef.current?.contains(node))
        problem.solve(["clipboard:caesar", "selection:busybox"]);
    };
    document.addEventListener("selectionchange", inspect);
    return () => document.removeEventListener("selectionchange", inspect);
  }, [copied, pasted, problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <p
        className="cipher-text"
        onCopy={(event) => {
          event.preventDefault();
          event.clipboardData.setData("text/plain", plain);
          setCopied(true);
        }}
      >
        {cipher}
      </p>
      <label className="paste-target">
        {props.locale === "ja" ? "ここへ戻す" : "Return it here"}
        <input
          type="text"
          onPaste={(event) => {
            if (copied && event.clipboardData.getData("text/plain") === plain)
              setPasted(true);
          }}
        />
      </label>
      <p ref={targetRef} className="cipher-result">
        {pasted ? plain : "••••••••"}
      </p>
    </div>
  );
}
