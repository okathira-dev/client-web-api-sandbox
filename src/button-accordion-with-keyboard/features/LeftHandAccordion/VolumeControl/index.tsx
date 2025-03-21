import { Slider, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import { useSetVolume, useVolumeValue } from "./atoms";

import type { FC } from "react";

export const VolumeControl: FC = () => {
  const { t } = useTranslation();
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
      <Typography sx={{ flexShrink: 0 }}>{t("accordion.volume")}</Typography>
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
