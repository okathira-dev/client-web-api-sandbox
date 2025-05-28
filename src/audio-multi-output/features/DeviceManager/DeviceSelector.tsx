import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";

import type { AudioOutputDevice } from "./consts";
import type React from "react";

interface DeviceSelectorProps {
  devices: AudioOutputDevice[];
  selectedDevices: string[];
  onDeviceToggle: (deviceId: string) => void;
  onRequestPermission: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  devices,
  selectedDevices,
  onDeviceToggle,
  onRequestPermission,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        音声出力デバイス選択
      </Typography>

      <Button variant="contained" onClick={onRequestPermission} sx={{ mb: 2 }}>
        デバイス選択権限を要求
      </Button>

      <Box>
        {devices.length === 0 ? (
          <Typography color="text.secondary">
            デバイスが見つかりません
          </Typography>
        ) : (
          devices.map((device) => (
            <FormControlLabel
              key={device.deviceId}
              control={
                <Checkbox
                  checked={selectedDevices.includes(device.deviceId)}
                  onChange={() => onDeviceToggle(device.deviceId)}
                />
              }
              label={device.label}
              sx={{ display: "block", mb: 1 }}
            />
          ))
        )}
      </Box>
    </Box>
  );
};
