import { Box, Typography, Divider } from "@mui/material";
import { useCallback, useEffect } from "react";

import { useIsPlayingValue, useSetIsPlaying } from "../../atoms/globalAtoms";
import { useSelectedDevicesValue, useDeviceListValue } from "../DeviceManager";
import {
  useAudioContextsValue,
  useSetAudioContexts,
  useOscillatorsValue,
  useSetOscillators,
  useGainNodesValue,
  useSetGainNodes,
} from "./atom";
import { DevicePanel } from "./DevicePanel";
import {
  createAudioOutput,
  startAudioOutput,
  stopAudioOutput,
  updateOscillatorSettings,
} from "./functions";
import { PlayButton } from "./PlayButton";
import {
  useOscillatorSettingsValue,
  DEFAULT_OSCILLATOR_SETTINGS,
} from "../OscillatorControl";

import type React from "react";

export const OutputController: React.FC = () => {
  const selectedDevices = useSelectedDevicesValue();
  const deviceList = useDeviceListValue();
  const oscillatorSettings = useOscillatorSettingsValue();
  const isPlaying = useIsPlayingValue();
  const setIsPlaying = useSetIsPlaying();

  const audioContexts = useAudioContextsValue();
  const setAudioContexts = useSetAudioContexts();
  const oscillators = useOscillatorsValue();
  const setOscillators = useSetOscillators();
  const gainNodes = useGainNodesValue();
  const setGainNodes = useSetGainNodes();

  // デバイスラベルの取得
  const getDeviceLabel = useCallback(
    (deviceId: string): string => {
      const device = deviceList.find((d) => d.deviceId === deviceId);
      return device?.label || deviceId;
    },
    [deviceList],
  );

  // 個別デバイスの再生開始
  const handlePlayDevice = useCallback(
    async (deviceId: string) => {
      try {
        // 既に再生中の場合は何もしない
        if (audioContexts[deviceId]) {
          return;
        }

        const settings =
          oscillatorSettings[deviceId] || DEFAULT_OSCILLATOR_SETTINGS;
        const { audioContext, oscillator, gainNode } = await createAudioOutput(
          deviceId,
          settings,
        );

        await startAudioOutput(audioContext, oscillator);

        setAudioContexts((prev) => ({ ...prev, [deviceId]: audioContext }));
        setOscillators((prev) => ({ ...prev, [deviceId]: oscillator }));
        setGainNodes((prev) => ({ ...prev, [deviceId]: gainNode }));
      } catch (error) {
        console.error(`デバイス ${deviceId} の再生開始に失敗:`, error);
      }
    },
    [
      audioContexts,
      oscillatorSettings,
      setAudioContexts,
      setOscillators,
      setGainNodes,
    ],
  );

  // 個別デバイスの再生停止
  const handleStopDevice = useCallback(
    (deviceId: string) => {
      try {
        const audioContext = audioContexts[deviceId];
        const oscillator = oscillators[deviceId];

        if (audioContext && oscillator) {
          stopAudioOutput(audioContext, oscillator);
        }

        setAudioContexts((prev) => {
          const newContexts = { ...prev };
          delete newContexts[deviceId];
          return newContexts;
        });
        setOscillators((prev) => {
          const newOscillators = { ...prev };
          delete newOscillators[deviceId];
          return newOscillators;
        });
        setGainNodes((prev) => {
          const newGainNodes = { ...prev };
          delete newGainNodes[deviceId];
          return newGainNodes;
        });
      } catch (error) {
        console.error(`デバイス ${deviceId} の再生停止に失敗:`, error);
      }
    },
    [
      audioContexts,
      oscillators,
      setAudioContexts,
      setOscillators,
      setGainNodes,
    ],
  );

  // 設定変更時のリアルタイム更新
  useEffect(() => {
    Object.keys(oscillators).forEach((deviceId) => {
      const oscillator = oscillators[deviceId];
      const gainNode = gainNodes[deviceId];
      const audioContext = audioContexts[deviceId];
      const settings = oscillatorSettings[deviceId];

      if (oscillator && gainNode && audioContext && settings) {
        updateOscillatorSettings(oscillator, gainNode, settings, audioContext);
      }
    });
  }, [oscillatorSettings, oscillators, gainNodes, audioContexts]);

  // 全体スイッチの状態を実際の再生状態に基づいて更新
  useEffect(() => {
    const playingDevicesCount = selectedDevices.filter(
      (deviceId) => audioContexts[deviceId],
    ).length;
    const allDevicesPlaying =
      playingDevicesCount === selectedDevices.length &&
      selectedDevices.length > 0;
    setIsPlaying(allDevicesPlaying);
  }, [selectedDevices, audioContexts, setIsPlaying]);

  if (selectedDevices.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          音声出力制御
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
        音声出力制御
      </Typography>

      <Box sx={{ mb: 3, textAlign: "center" }}>
        <PlayButton
          isPlaying={isPlaying}
          onChange={(playing) => {
            if (playing) {
              // 全デバイスを再生（既に再生中のものは重複しない）
              selectedDevices.forEach((deviceId) => {
                void handlePlayDevice(deviceId);
              });
            } else {
              // 全デバイスを停止
              selectedDevices.forEach((deviceId) => {
                handleStopDevice(deviceId);
              });
            }
          }}
          disabled={selectedDevices.length === 0}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          デバイス別制御
        </Typography>
        {selectedDevices.map((deviceId) => {
          const settings =
            oscillatorSettings[deviceId] || DEFAULT_OSCILLATOR_SETTINGS;
          const deviceLabel = getDeviceLabel(deviceId);
          const isDevicePlaying = !!audioContexts[deviceId];

          return (
            <DevicePanel
              key={deviceId}
              deviceId={deviceId}
              deviceLabel={deviceLabel}
              settings={settings}
              isPlaying={isDevicePlaying}
              onChange={(playing) => {
                if (playing) {
                  void handlePlayDevice(deviceId);
                } else {
                  handleStopDevice(deviceId);
                }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
};
