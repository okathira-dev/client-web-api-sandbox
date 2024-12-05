import React from "react";
import TextField from "@mui/material/TextField";
import {
  useRelativeReedPitches,
  useSetRelativeReedPitches,
  useAdaptAllReedPitches,
  useBaseReedPitch,
  useSetBaseReedPitch,
} from "../atoms/reeds";
import { reedNames } from "../audio/synth";

export const ReedPitchControls: React.FC = () => {
  const relativeReedPitches = useRelativeReedPitches();
  const setRelativeReedPitches = useSetRelativeReedPitches();
  const baseReedPitch = useBaseReedPitch();
  const setBaseReedPitch = useSetBaseReedPitch();

  const adaptAllReedPitches = useAdaptAllReedPitches();
  adaptAllReedPitches(); // CHECK: ピッチの更新

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px" }}>基準ピッチ[cent]</div>
        <TextField
          type="number"
          value={baseReedPitch}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            setBaseReedPitch(isNaN(newValue) ? baseReedPitch : newValue);
          }}
          slotProps={{ htmlInput: { min: -1200, max: 1200, step: 1 } }}
          aria-label="基準ピッチ"
        />
      </div>

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
    </div>
  );
};
