import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import * as Tone from "tone";

type LatencyInfo = {
  baseLatency: number | undefined;
  outputLatency: number | undefined;
  lookAhead: number | undefined;
  updateInterval: number | undefined;
};

export const LatencyDisplay = () => {
  const [latencyInfo, setLatencyInfo] = useState<LatencyInfo>({
    baseLatency: undefined,
    outputLatency: undefined,
    lookAhead: undefined,
    updateInterval: undefined,
  });

  // Tone.BaseContextにupdateIntervalは無いが、実際にはgetterが用意されているので型を拡張する。
  type ExtendedToneContext = Tone.BaseContext & {
    updateInterval: number;
  };

  // Tone.BaseContextのrawContextはAudioContextではなく、AudioContextをラップしたオブジェクトになっている。
  type ExtendedToneRawContext = AudioContext & {
    _nativeAudioContext: AudioContext;
  };

  useEffect(() => {
    const updateLatency = () => {
      console.log("updateLatency");
      const toneContext = Tone.getContext() as ExtendedToneContext;
      console.log("toneContext", toneContext);
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

  const formatLatency = (seconds: number | undefined): string => {
    if (seconds === undefined) {
      return "計測不可";
    }
    return `${Math.round(seconds * 1000 * 100) / 100}ms`;
  };

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
        sx={{
          color: "text.secondary",
          fontSize: "0.9rem",
        }}
      >
        音声出力の遅延時間
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          color: "text.secondary",
          fontSize: "0.8rem",
        }}
      >
        <Typography>
          更新間隔(updateInterval): {formatLatency(latencyInfo.updateInterval)}
        </Typography>
        <Typography>
          先読み時間(lookAhead): {formatLatency(latencyInfo.lookAhead)}
        </Typography>
        <Typography>
          基本遅延(baseLatency): {formatLatency(latencyInfo.baseLatency)}
        </Typography>
        <Typography>
          出力遅延(outputLatency): {formatLatency(latencyInfo.outputLatency)}
        </Typography>
        <Typography>
          遅延合計(lookAhead + baseLatency + outputLatency):{" "}
          {formatLatency(totalLatency)}
        </Typography>
      </Stack>
    </Stack>
  );
};
