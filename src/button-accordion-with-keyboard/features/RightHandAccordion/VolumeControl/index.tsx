import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { setVolumes } from "../audio/audioProcessor";

export const VolumeControl: React.FC = () => {
  const [volume, setVolume] = useState<number>(-18);

  useEffect(() => {
    setVolumes(volume);
  }, [volume]);

  const handleVolumeChange = (_event: Event, value: number | number[]) => {
    if (typeof value === "number") {
      setVolume(value);
    }
  };

  return (
    <label style={{ width: "100%" }}>
      Volume
      <Slider
        value={volume}
        min={-60}
        max={0}
        step={1}
        valueLabelDisplay="auto"
        onChange={handleVolumeChange}
      />
    </label>
  );
};
