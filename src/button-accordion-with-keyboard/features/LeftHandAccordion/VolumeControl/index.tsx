import { Slider, Typography } from "@mui/material";

import { useSetVolume, useVolumeValue } from "./atoms";

import type { FC } from "react";

export const VolumeControl: FC = () => {
  const volume = useVolumeValue();
  const setVolume = useSetVolume();

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
      <Typography gutterBottom>音量</Typography>
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
