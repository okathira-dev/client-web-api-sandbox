import { Box, Typography, Alert } from "@mui/material";
import { useEffect, useCallback } from "react";

import {
  useDeviceListValue,
  useSetDeviceList,
  useSelectedDevicesValue,
  useSetSelectedDevices,
} from "./atom";
import { DeviceSelector } from "./DeviceSelector";
import {
  enumerateAudioDevices,
  startDeviceChangeMonitoring,
  requestAudioOutputPermission,
} from "./functions";

import type React from "react";

export const DeviceManager: React.FC = () => {
  const devices = useDeviceListValue();
  const setDevices = useSetDeviceList();
  const selectedDevices = useSelectedDevicesValue();
  const setSelectedDevices = useSetSelectedDevices();

  // デバイス一覧を更新
  const updateDevices = useCallback(async () => {
    try {
      const deviceList = await enumerateAudioDevices();
      setDevices(deviceList);
    } catch (error) {
      console.error("デバイス一覧の更新に失敗:", error);
    }
  }, [setDevices]);

  // デバイス選択の切り替え
  const handleDeviceToggle = useCallback(
    (deviceId: string) => {
      setSelectedDevices((prev) =>
        prev.includes(deviceId)
          ? prev.filter((id) => id !== deviceId)
          : [...prev, deviceId],
      );
    },
    [setSelectedDevices],
  );

  // デバイス選択権限の要求
  const handleRequestPermission = useCallback(() => {
    void (async () => {
      const granted = await requestAudioOutputPermission();
      if (granted) {
        // 権限が付与されたらデバイス一覧を更新
        await updateDevices();
      }
    })();
  }, [updateDevices]);

  // 初期化とデバイス変更監視
  useEffect(() => {
    void updateDevices();

    // デバイス変更の監視を開始
    const cleanup = startDeviceChangeMonitoring(() => {
      void updateDevices();
    });

    return cleanup;
  }, [updateDevices]);

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        デバイス管理
      </Typography>

      <DeviceSelector
        devices={devices}
        selectedDevices={selectedDevices}
        onDeviceToggle={handleDeviceToggle}
        onRequestPermission={handleRequestPermission}
      />

      {selectedDevices.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" component="strong">
            選択されたデバイス: {selectedDevices.length}個
          </Typography>
        </Alert>
      )}
    </Box>
  );
};
