import React from "react";
import { BasePitchControl } from "./RightHandBasePitchControl";
import { RelativePitchControls } from "./RightHandRelativePitchControls";

export const ReedPitchControls: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <BasePitchControl />
      <RelativePitchControls />
    </div>
  );
};
