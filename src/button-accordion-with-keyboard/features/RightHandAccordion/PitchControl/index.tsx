import { BasePitchControl } from "./BasePitchControl";
import { RelativePitchControl } from "./RelativePitchControl";

import type { FC } from "react";

export const PitchControl: FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <BasePitchControl />
      <RelativePitchControl />
    </div>
  );
};
