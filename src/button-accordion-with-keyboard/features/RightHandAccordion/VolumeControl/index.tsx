import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { setVolumes } from "../audio/audioProcessor";

import type { FC } from "react";

export const VolumeControl: FC = () => {
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
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <Typography sx={{ flexShrink: 0 }}>音量</Typography>
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
