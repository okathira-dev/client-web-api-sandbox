import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { setAllReedVolumes } from "../audio/synth";

export const VolumeControl: React.FC = () => {
  const [volume, setVolume] = useState<number>(-18);

  useEffect(() => {
    setAllReedVolumes(volume);
  }, []);

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    setAllReedVolumes(newVolume);
  };

  return (
    <div style={{ width: "700px" }}>
      <label>
        Volume
        <Slider
          value={volume}
          onChange={handleVolumeChange}
          min={-60}
          max={0}
          step={1}
          valueLabelDisplay="auto"
        />
      </label>
    </div>
  );
};