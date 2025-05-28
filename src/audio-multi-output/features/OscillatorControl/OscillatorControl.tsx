import { Box, Typography, Card, CardContent } from "@mui/material";
import { useCallback } from "react";

import { useSelectedDevicesValue } from "../DeviceManager";
import { useOscillatorSettingsValue, useSetOscillatorSettings } from "./atom";
import { DEFAULT_OSCILLATOR_SETTINGS } from "./consts";
import { FrequencySlider } from "./FrequencySlider";
import { PhaseSwitch } from "./PhaseSwitch";
import { WaveformSelector } from "./WaveformSelector";

import type { OscillatorSettings } from "./consts";
import type React from "react";

export const OscillatorControl: React.FC = () => {
  const selectedDevices = useSelectedDevicesValue();
  const oscillatorSettings = useOscillatorSettingsValue();
  const setOscillatorSettings = useSetOscillatorSettings();

  // デバイス設定の更新
  const updateDeviceSettings = useCallback(
    (deviceId: string, updates: Partial<OscillatorSettings>) => {
      setOscillatorSettings((prev) => ({
        ...prev,
        [deviceId]: {
          ...DEFAULT_OSCILLATOR_SETTINGS,
          ...prev[deviceId],
          ...updates,
        },
      }));
    },
    [setOscillatorSettings],
  );

  // デバイス設定の取得
  const getDeviceSettings = useCallback(
    (deviceId: string): OscillatorSettings => {
      return oscillatorSettings[deviceId] || DEFAULT_OSCILLATOR_SETTINGS;
    },
    [oscillatorSettings],
  );

  if (selectedDevices.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          オシレーター制御
        </Typography>
        <Typography color="text.secondary">
          デバイスを選択してください
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        オシレーター制御
      </Typography>

      {selectedDevices.map((deviceId) => {
        const settings = getDeviceSettings(deviceId);

        return (
          <Card key={deviceId} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
                デバイス: {deviceId === "default" ? "デフォルト" : deviceId}
              </Typography>

              <WaveformSelector
                value={settings.waveform}
                onChange={(waveform) =>
                  updateDeviceSettings(deviceId, { waveform })
                }
              />

              <FrequencySlider
                value={settings.frequency}
                onChange={(frequency) =>
                  updateDeviceSettings(deviceId, { frequency })
                }
              />

              <PhaseSwitch
                value={settings.phaseInvert}
                onChange={(phaseInvert) =>
                  updateDeviceSettings(deviceId, { phaseInvert })
                }
              />
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
