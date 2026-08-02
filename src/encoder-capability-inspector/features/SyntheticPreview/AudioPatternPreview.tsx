import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { Box, Button, Stack } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TestMode } from "../../domain/types";
import {
  PREVIEW_AUDIO_GAIN,
  PREVIEW_WAVEFORM_HEIGHT,
  PREVIEW_WAVEFORM_WIDTH,
} from "./consts";
import { buildPreviewAudio, type PreviewAudio } from "./functions";
import { PatternCanvas } from "./PatternCanvas";

/** チャンネルごとに、列ごとの最小・最大を塗って波形にする。 */
const drawWaveform = (
  context: CanvasRenderingContext2D,
  audio: PreviewAudio,
  color: string,
  background: string,
): void => {
  const { samples, channels, frames } = audio;
  const laneHeight = PREVIEW_WAVEFORM_HEIGHT / channels;
  context.fillStyle = background;
  context.fillRect(0, 0, PREVIEW_WAVEFORM_WIDTH, PREVIEW_WAVEFORM_HEIGHT);
  context.fillStyle = color;

  for (let channel = 0; channel < channels; channel += 1) {
    const center = laneHeight * (channel + 0.5);
    for (let column = 0; column < PREVIEW_WAVEFORM_WIDTH; column += 1) {
      const from = Math.floor((column * frames) / PREVIEW_WAVEFORM_WIDTH);
      const to = Math.max(
        from + 1,
        Math.floor(((column + 1) * frames) / PREVIEW_WAVEFORM_WIDTH),
      );
      let low = 0;
      let high = 0;
      for (let index = from; index < to; index += 1) {
        const value = samples[channel * frames + index] ?? 0;
        if (value < low) low = value;
        if (value > high) high = value;
      }
      const top = center - (high * laneHeight) / 2;
      const bottom = center - (low * laneHeight) / 2;
      context.fillRect(column, top, 1, Math.max(1, bottom - top));
    }
  }
};

type AudioPatternPreviewProps = {
  readonly testMode: TestMode;
  readonly disabled: boolean;
};

export const AudioPatternPreview = ({
  testMode,
  disabled,
}: AudioPatternPreviewProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [playing, setPlaying] = useState(false);

  const audio = useMemo(() => buildPreviewAudio(testMode), [testMode]);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    drawWaveform(context, audio, "#4fc3f7", "#101418");
  }, [audio]);

  const stop = () => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlaying(false);
  };

  // 検査が始まったら鳴らし続けない。停止処理はここに閉じ、毎描画で作り直す関数に依存させない。
  useEffect(() => {
    if (!disabled) return;
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlaying(false);
  }, [disabled]);

  useEffect(
    () => () => {
      sourceRef.current?.stop();
      void contextRef.current?.close();
    },
    [],
  );

  const play = () => {
    // 自動再生の制限があるので、操作されて初めて AudioContext を作る。
    contextRef.current ??= new AudioContext({ sampleRate: audio.sampleRate });
    const context = contextRef.current;
    void context.resume();

    const buffer = context.createBuffer(
      audio.channels,
      audio.frames,
      audio.sampleRate,
    );
    for (let channel = 0; channel < audio.channels; channel += 1) {
      buffer.copyToChannel(
        audio.samples.subarray(
          channel * audio.frames,
          (channel + 1) * audio.frames,
        ),
        channel,
      );
    }

    const gain = context.createGain();
    gain.gain.value = PREVIEW_AUDIO_GAIN;
    gain.connect(context.destination);

    const source = context.createBufferSource();
    source.buffer = buffer;
    // 継ぎ目が出ないかを聴きたいので繰り返し再生する。
    source.loop = true;
    source.connect(gain);
    source.onended = () => {
      setPlaying(false);
    };
    source.start();

    sourceRef.current?.stop();
    sourceRef.current = source;
    setPlaying(true);
  };

  return (
    <Stack spacing={1}>
      <PatternCanvas
        ref={canvasRef}
        width={PREVIEW_WAVEFORM_WIDTH}
        height={PREVIEW_WAVEFORM_HEIGHT}
        aria-label={t(
          testMode === "sustained"
            ? "preview.sustainedAudioLabel"
            : "preview.compatibilityAudioLabel",
        )}
        sx={{ maxWidth: PREVIEW_WAVEFORM_WIDTH }}
      />
      <Box>
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          startIcon={playing ? <StopIcon /> : <PlayArrowIcon />}
          onClick={playing ? stop : play}
        >
          {t(playing ? "preview.stop" : "preview.play")}
        </Button>
      </Box>
    </Stack>
  );
};
