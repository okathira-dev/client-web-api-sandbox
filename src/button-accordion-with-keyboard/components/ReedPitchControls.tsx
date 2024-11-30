import React from "react";
import TextField from "@mui/material/TextField";
import {
  useRelativeReedPitches,
  useSetRelativeReedPitches,
  useAdaptAllReedPitches,
} from "../atoms/reeds";
import { reedNames } from "../audio/synth";
export const ReedPitchControls: React.FC = () => {
  const relativeReedPitches = useRelativeReedPitches();
  const setRelativeReedPitches = useSetRelativeReedPitches();

  const adaptAllReedPitches = useAdaptAllReedPitches();
  adaptAllReedPitches(); // CHECK: ピッチの更新

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {reedNames.map((reed) => (
        <div
          key={reed}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>{reed}</span>
          <TextField
            type="number"
            value={relativeReedPitches[reed]}
            onChange={(e) => {
              const newValue = parseInt(e.target.value, 10);
              setRelativeReedPitches((prev) => ({
                ...prev,
                [reed]: isNaN(newValue) ? prev[reed] : newValue,
              }));
            }}
            slotProps={{ htmlInput: { min: -2500, max: 2500, step: 1 } }}
            aria-labelledby={`${reed}-pitch-input`}
          />
        </div>
      ))}
    </div>
  );
};
