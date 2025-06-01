import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { useId } from "react";

import { WAVEFORM_TYPES } from "./consts";

import type { OscillatorType } from "./consts";
import type React from "react";

interface WaveformSelectorProps {
  value: OscillatorType;
  onChange: (waveform: OscillatorType) => void;
}

export const WaveformSelector: React.FC<WaveformSelectorProps> = ({
  value,
  onChange,
}) => {
  const waveformSelectId = `waveform-select-${useId()}`;

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth>
        <InputLabel id={waveformSelectId}>波形</InputLabel>
        <Select
          labelId={waveformSelectId}
          value={value}
          label="波形"
          onChange={(e) => onChange(e.target.value as OscillatorType)}
        >
          {Object.entries(WAVEFORM_TYPES).map(([key, label]) => (
            <MenuItem key={key} value={key}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
