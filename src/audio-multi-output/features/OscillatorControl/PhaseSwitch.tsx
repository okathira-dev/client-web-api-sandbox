import { Box, FormControlLabel, Switch, Typography } from "@mui/material";

import type React from "react";

interface PhaseSwitchProps {
  value: boolean;
  onChange: (phaseInvert: boolean) => void;
}

export const PhaseSwitch: React.FC<PhaseSwitchProps> = ({
  value,
  onChange,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            位相反転
          </Typography>
        }
      />
    </Box>
  );
};
