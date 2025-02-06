import React from "react";
import { BasePitchControl } from "./BasePitchControl";
import { RelativePitchControls } from "./RelativePitchControls";

export const ReedPitchControls: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <BasePitchControl />
      <RelativePitchControls />
    </div>
  );
};
