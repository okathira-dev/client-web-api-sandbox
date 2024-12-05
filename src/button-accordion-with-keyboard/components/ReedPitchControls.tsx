import React from "react";
import { BasePitchControl } from "./pitch-controls/BasePitchControl";
import { RelativePitchControls } from "./pitch-controls/RelativePitchControls";

export const ReedPitchControls: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <BasePitchControl />
      <RelativePitchControls />
    </div>
  );
};
