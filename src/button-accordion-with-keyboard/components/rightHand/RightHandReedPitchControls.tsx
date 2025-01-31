import React from "react";
import { RightHandBasePitchControl } from "./RightHandBasePitchControl";
import { RightHandRelativePitchControls } from "./RightHandRelativePitchControls";

export const RightHandReedPitchControls: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <RightHandBasePitchControl />
      <RightHandRelativePitchControls />
    </div>
  );
};
