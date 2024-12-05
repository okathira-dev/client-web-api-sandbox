import React from "react";
import TextField from "@mui/material/TextField";
import {
  useRelativeReedPitches,
  useSetRelativeReedPitches,
} from "../../atoms/reeds";
import { reedNames } from "../../audio/synth";

export const RelativePitchControls: React.FC = () => {
  const relativeReedPitches = useRelativeReedPitches();
  const setRelativeReedPitches = useSetRelativeReedPitches();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <span style={{ flexShrink: 0 }}>相対ピッチ</span>
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
              size="small"
              slotProps={{
                htmlInput: {
                  step: 1,
                },
              }}
              aria-labelledby={`${reed}-pitch-input`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
