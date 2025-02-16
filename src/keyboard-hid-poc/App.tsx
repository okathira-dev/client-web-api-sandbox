import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useHIDKeyboard } from "./hooks/useHIDKeyboard";
import { keyCodeToChar } from "./utils/keyCodeToChar";

export const App = () => {
  const [keyHistory, setKeyHistory] = useState<string[]>([]);

  const handleKeyPress = (keyCode: number) => {
    const char = keyCodeToChar(keyCode);
    console.log("Pressed key:", { keyCode, char });
    setKeyHistory((prev) => [...prev, char].slice(-10));
  };

  const { devices, selectedDevice, error, requestDevices, selectDevice } =
    useHIDKeyboard(handleKeyPress);

  const handleRequestDevices = async () => {
    try {
      await requestDevices();
    } catch (err) {
      console.error("Failed to request devices:", err);
    }
  };

  const handleDeviceSelect = async (deviceName: string) => {
    const device = devices.find((d) => d.device.productName === deviceName);
    if (device) {
      try {
        await selectDevice(device.device);
      } catch (err) {
        console.error("Failed to select device:", err);
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        HIDキーボード入力テスト
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          HIDキーボードを選択して入力をテストします。
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={() => {
              void handleRequestDevices();
            }}
            sx={{ mr: 2 }}
            disabled={!!selectedDevice}
          >
            キーボードを選択
          </Button>
        </Box>

        {devices.length > 0 && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>デバイスを選択</InputLabel>
            <Select
              value={selectedDevice?.productName || ""}
              label="デバイスを選択"
              onChange={(e) => void handleDeviceSelect(e.target.value)}
            >
              {devices.map((device) => (
                <MenuItem
                  key={device.device.productId}
                  value={device.device.productName}
                >
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            エラー: {error}
          </Typography>
        )}

        {selectedDevice && (
          <Typography variant="body2" color="success.main">
            接続済み: {selectedDevice.productName}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          入力履歴:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {keyHistory.map((key, index) => (
            <Paper
              key={index}
              sx={{
                p: 1,
                minWidth: "40px",
                textAlign: "center",
                backgroundColor: "primary.dark",
              }}
            >
              <Typography>{key}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};
