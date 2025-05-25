import { PlayArrow, Stop } from "@mui/icons-material";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";

import type React from "react";

interface PlayButtonProps {
  isPlaying: boolean;
  onChange: (playing: boolean) => void;
  disabled?: boolean;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onChange,
  disabled = false,
}) => {
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={isPlaying}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            color="primary"
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", ml: 1 }}>
            {isPlaying ? (
              <Stop sx={{ mr: 0.5 }} />
            ) : (
              <PlayArrow sx={{ mr: 0.5 }} />
            )}
            <Typography variant="body1" sx={{ fontWeight: "medium" }}>
              {isPlaying ? "停止" : "再生"}
            </Typography>
          </Box>
        }
        sx={{ m: 0 }}
      />
    </Box>
  );
};
