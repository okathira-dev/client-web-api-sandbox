import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { setAllReedVolumes } from "../audio/synth";

export const VolumeControl: React.FC = () => {
  const [volume, setVolume] = useState<number>(-18);

  useEffect(() => {
    setAllReedVolumes(volume);
  }, [volume]);

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
  };

  return (
    <label style={{ width: "100%" }}>
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
  );
};
