import React from "react";
import Slider from "@mui/material/Slider";
import { useVolume, useSetVolume, useAdaptAllReedVolumes } from "../reeds";

export const VolumeControl: React.FC = () => {
  const volume = useVolume();
  const setVolume = useSetVolume();

  const adaptAllReedVolumes = useAdaptAllReedVolumes();
  adaptAllReedVolumes(); // CHECK: ボリュームの更新

  return (
    <div style={{ width: "700px" }}>
      <label>
        Volume
        <Slider
          value={volume}
          onChange={(_, newValue) => {
            const newVolume = newValue as number;
            setVolume(newVolume);
          }}
          min={-60}
          max={0}
          step={1}
          valueLabelDisplay="auto"
        />
      </label>
    </div>
  );
};
