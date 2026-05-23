import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { createMicrophoneAnalyser } from "../../domain/acoustic-core/audioIO";
import { formatMicConstraintsSummary } from "../../domain/acoustic-core/micConstraints";
import type { DemodSensitivityConfig } from "../../domain/pipeline/demodConfig";

interface CalibrationPanelProps {
  disabled?: boolean;
  demodConfig: DemodSensitivityConfig;
  onDemodConfigChange: (next: DemodSensitivityConfig) => void;
}

export function CalibrationPanel({
  disabled = false,
  demodConfig,
  onDemodConfigChange,
}: CalibrationPanelProps) {
  const [active, setActive] = useState(false);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const handleRef = useRef<Awaited<
    ReturnType<typeof createMicrophoneAnalyser>
  > | null>(null);

  useEffect(() => {
    if (!active) return;

    let timer = 0;
    timer = window.setInterval(() => {
      const next = handleRef.current?.readLevel() ?? 0;
      setLevel(Math.min(1, next * 6 * demodConfig.inputGain));
    }, 120);

    return () => {
      window.clearInterval(timer);
    };
  }, [active, demodConfig.inputGain]);

  const stop = async () => {
    setActive(false);
    setLevel(0);
    const handle = handleRef.current;
    handleRef.current = null;
    await handle?.close();
  };

  const start = async () => {
    setError("");
    try {
      await stop();
      handleRef.current = await createMicrophoneAnalyser();
      setActive(true);
    } catch (cause) {
      setError(`キャリブレーション開始に失敗しました: ${String(cause)}`);
      setActive(false);
    }
  };

  useEffect(() => {
    return () => {
      const handle = handleRef.current;
      handleRef.current = null;
      if (handle) {
        void handle.close();
      }
    };
  }, []);

  const updateConfig = (patch: Partial<DemodSensitivityConfig>) => {
    onDemodConfigChange({ ...demodConfig, ...patch });
  };

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">キャリブレーション</Typography>
        <Typography variant="body2" color="text.secondary">
          受信前にマイク入力レベルを確認します。Web Audio
          自前モデムの入力ゲインは モデムチューニングパネルで調整します。
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={formatMicConstraintsSummary()} />
          <Chip
            size="small"
            color={demodConfig.mode === "auto" ? "primary" : "default"}
            label={`感度: ${demodConfig.mode === "auto" ? "自動" : "手動"}`}
          />
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">
            入力ゲイン: {demodConfig.inputGain.toFixed(1)}x
          </Typography>
          <Slider
            size="small"
            min={1}
            max={4}
            step={0.1}
            value={demodConfig.inputGain}
            onChange={(_, value) =>
              updateConfig({ inputGain: value as number })
            }
            disabled={disabled}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button
            variant={active ? "outlined" : "contained"}
            onClick={() => void (active ? stop() : start())}
            disabled={disabled}
            color={active ? "warning" : "primary"}
          >
            {active ? "レベル計測停止" : "レベル計測開始"}
          </Button>
          <Typography variant="caption" color="text.secondary">
            レベル {(level * 100).toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={level * 100} />
        {level > 0.8 && (
          <Alert severity="warning">
            入力が飽和気味です。送信側の音量を少し下げるか、入力ゲインを下げてください。
          </Alert>
        )}
        {level > 0 && level < 0.08 && (
          <Alert severity="info">
            入力が小さいです。入力ゲインを上げるか、送信側の音量・距離を調整してください。
          </Alert>
        )}
        {error.length > 0 && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
