import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

/** S-490 — type the placeholder's exact name. H-001/H-004/H-020. */
export default function S490Stage(props: StageComponentProps) {
  const problem = props.problem("S-490-B01");
  const [value, setValue] = useState("");
  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
      <input
        className="paste-target"
        value={value}
        placeholder="busybox"
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          const next = event.currentTarget.value;
          setValue(next);
          if (next === "busybox") problem.solve(["input:busybox"]);
        }}
      />
    </div>
  );
}
