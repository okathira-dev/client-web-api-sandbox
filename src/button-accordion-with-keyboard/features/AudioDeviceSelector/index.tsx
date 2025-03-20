import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as Tone from "tone";

import {
  useAudioDeviceError,
  useAudioDevices,
  useSetAudioDeviceError,
} from "./atoms";

import type { SelectChangeEvent } from "@mui/material";

// Tone.js の型定義を拡張して、ネイティブのAudioContext に setSinkId メソッドを追加
type ExtendedRawContext = AudioContext & {
  _nativeAudioContext: AudioContext & {
    setSinkId: (deviceId: string) => Promise<void>;
  };
};

export { initializeAudioDevices } from "./utils";

const audioDeviceSelectLabelId = "audio-device-select-label";

export function AudioDeviceSelector() {
  const { t } = useTranslation();
  const devices = useAudioDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const audioDeviceError = useAudioDeviceError();
  const setAudioDeviceError = useSetAudioDeviceError();

  const handleDeviceChange = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);

    const rawContext = Tone.getContext().rawContext as ExtendedRawContext;
    const nativeAudioContext = rawContext._nativeAudioContext;

    // chrome110 から AudioContext の出力デバイスを変更できるようになった ref: https://developer.chrome.com/blog/audiocontext-setsinkid?hl=ja
    // デフォルトデバイスの場合は空文字列を使用
    const sinkId = deviceId === "default" ? "" : deviceId;
    void nativeAudioContext.setSinkId(sinkId).catch((error: unknown) => {
      if (error instanceof Error) {
        setAudioDeviceError(
          t("accordion.audio.errors.change", { message: error.message }),
        );
      }
    });
  };

  // ブラウザのサポート状況をチェック
  if (!("setSinkId" in AudioContext.prototype)) {
    return (
      <Alert severity="warning" sx={{ minWidth: 200 }}>
        {t("accordion.audio.errors.browser")}
      </Alert>
    );
  }

  if (devices.length === 0) {
    return (
      <Stack spacing={2} sx={{ minWidth: 200 }}>
        <Typography variant="body2" color="text.secondary">
          {t("accordion.audio.errors.permission")}
        </Typography>
        {audioDeviceError && <Alert severity="error">{audioDeviceError}</Alert>}
      </Stack>
    );
  }

  return (
    <Stack spacing={2} sx={{ minWidth: 200 }}>
      {audioDeviceError && <Alert severity="error">{audioDeviceError}</Alert>}
      <FormControl>
        <InputLabel id={audioDeviceSelectLabelId}>
          {t("accordion.audio.device")}
        </InputLabel>
        <Select
          labelId={audioDeviceSelectLabelId}
          value={selectedDevice}
          label={t("accordion.audio.device")}
          onChange={handleDeviceChange}
        >
          {devices.map((device) => (
            <MenuItem key={device.deviceId} value={device.deviceId}>
              {device.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
