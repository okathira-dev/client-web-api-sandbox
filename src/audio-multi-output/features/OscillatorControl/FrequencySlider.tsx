import { Box, Typography, Slider } from "@mui/material";

import { FREQUENCY_RANGE } from "./consts";

import type React from "react";

interface FrequencySliderProps {
  value: number;
  onChange: (frequency: number) => void;
}

export const FrequencySlider: React.FC<FrequencySliderProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
        周波数: {value} Hz
      </Typography>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={FREQUENCY_RANGE.min}
        max={FREQUENCY_RANGE.max}
        step={1}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value} Hz`}
      />
    </Box>
  );
};
