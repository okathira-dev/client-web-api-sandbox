import { FC } from "react";
import { BasePitchControl } from "./BasePitchControl";
import { RelativePitchControl } from "./RelativePitchControl";

export const PitchControl: FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <BasePitchControl />
      <RelativePitchControl />
    </div>
  );
};
