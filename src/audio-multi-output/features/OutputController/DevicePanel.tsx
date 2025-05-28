import { Box, Card, CardContent, Typography, Chip, Stack } from "@mui/material";

import { PlayButton } from "./PlayButton";

import type { OscillatorSettings } from "../OscillatorControl";
import type React from "react";

interface DevicePanelProps {
  deviceId: string;
  deviceLabel: string;
  settings: OscillatorSettings;
  isPlaying: boolean;
  onChange: (playing: boolean) => void;
}

export const DevicePanel: React.FC<DevicePanelProps> = ({
  deviceId: _deviceId,
  deviceLabel,
  settings,
  isPlaying,
  onChange,
}) => {
  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: isPlaying ? "success.light" : "grey.50",
        border: 1,
        borderColor: isPlaying ? "success.main" : "grey.300",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="h4">
            {deviceLabel}
          </Typography>
          <PlayButton isPlaying={isPlaying} onChange={onChange} />
        </Box>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label={`波形: ${settings.waveform}`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`周波数: ${settings.frequency} Hz`}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`位相反転: ${settings.phaseInvert ? "ON" : "OFF"}`}
            variant="outlined"
            size="small"
            color={settings.phaseInvert ? "warning" : "default"}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};
