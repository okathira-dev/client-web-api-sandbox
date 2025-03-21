import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import * as Tone from "tone";

type LatencyInfo = {
  baseLatency: number | undefined;
  outputLatency: number | undefined;
  lookAhead: number | undefined;
  updateInterval: number | undefined;
};

const formatLatency = (
  seconds: number | undefined,
  t: ReturnType<typeof useTranslation>["t"],
): string => {
  if (seconds === undefined) {
    return t("accordion.latency.unavailable");
  }
  return `${Math.round(seconds * 1000 * 100) / 100}ms`;
};

export const LatencyDisplay = () => {
  const { t } = useTranslation();
  const [latencyInfo, setLatencyInfo] = useState<LatencyInfo>({
    baseLatency: undefined,
    outputLatency: undefined,
    lookAhead: undefined,
    updateInterval: undefined,
  });

  // Tone.BaseContextにupdateIntervalは無いが、実際にはgetterが用意されているので型を拡張する。
  type ExtendedToneContext = Tone.BaseContext & { updateInterval: number };

  // Tone.BaseContextのrawContextはAudioContextではなく、AudioContextをラップしたオブジェクトになっている。
  type ExtendedToneRawContext = AudioContext & {
    _nativeAudioContext: AudioContext;
  };

  useEffect(() => {
    const updateLatency = () => {
      const toneContext = Tone.getContext() as ExtendedToneContext;
      const rawContext = toneContext.rawContext as ExtendedToneRawContext;

      // OfflineAudioContextの場合は遅延時間を取得できないため、早期リターン
      if (rawContext instanceof OfflineAudioContext) {
        console.log("OfflineAudioContext", rawContext);
        return;
      }

      // AudioContextの場合のみ遅延時間を取得
      // (rawContext instanceof AudioContext) はtrueにならない ref: https://github.com/Tonejs/Tone.js/issues/1298
      // outputLatency がrawContextにはないため、_nativeAudioContextを参照する
      const nativeAudioContext = rawContext._nativeAudioContext;
      setLatencyInfo({
        baseLatency: nativeAudioContext.baseLatency,
        outputLatency: nativeAudioContext.outputLatency,
        lookAhead: toneContext.lookAhead,
        updateInterval: toneContext.updateInterval,
      });
    };

    const interval = setInterval(updateLatency, 1000);
    return () => clearInterval(interval);
  }, []);

  // 遅延時間の合計を計算
  // updateIntervalは遅延に影響しないっぽい
  const totalLatency =
    latencyInfo.baseLatency === undefined ||
    latencyInfo.outputLatency === undefined ||
    latencyInfo.lookAhead === undefined
      ? undefined
      : latencyInfo.baseLatency +
        latencyInfo.outputLatency +
        latencyInfo.lookAhead;

  return (
    <Stack spacing={0.5} alignItems="center">
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", fontSize: "0.9rem" }}
      >
        {t("accordion.latency.label")}
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{ color: "text.secondary", fontSize: "0.8rem" }}
      >
        <Typography>
          {t("accordion.latency.update", {
            value: formatLatency(latencyInfo.updateInterval, t),
          })}
        </Typography>
        <Typography>
          {t("accordion.latency.lookAhead", {
            value: formatLatency(latencyInfo.lookAhead, t),
          })}
        </Typography>
        <Typography>
          {t("accordion.latency.base", {
            value: formatLatency(latencyInfo.baseLatency, t),
          })}
        </Typography>
        <Typography>
          {t("accordion.latency.output", {
            value: formatLatency(latencyInfo.outputLatency, t),
          })}
        </Typography>
        <Typography>
          {t("accordion.latency.total", {
            value: formatLatency(totalLatency, t),
          })}
        </Typography>
      </Stack>
    </Stack>
  );
};
