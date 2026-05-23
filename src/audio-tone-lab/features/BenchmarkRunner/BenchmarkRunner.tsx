import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import type { TransferRole } from "../../domain/modems/types";
import { formatBytes } from "../../utils/format";

interface BenchmarkRunnerProps {
  transferRole: TransferRole;
  selectedModemLabel: string;
  payloadSizeBytes: number;
  busy: boolean;
  isReceiving: boolean;
  canRun: boolean;
  onRun: () => void;
  onClearResults: () => void;
}

export function BenchmarkRunner({
  transferRole,
  selectedModemLabel,
  payloadSizeBytes,
  busy,
  isReceiving,
  canRun,
  onRun,
  onClearResults,
}: BenchmarkRunnerProps) {
  const isLongRun =
    transferRole === "sender" && payloadSizeBytes >= 5 * 1024 * 1024;

  const primaryLabel =
    transferRole === "sender"
      ? busy
        ? "送信中..."
        : "送信開始"
      : isReceiving
        ? "受信停止"
        : "受信待機開始";

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">
          {transferRole === "sender" ? "送信実行" : "受信実行"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          役割: {transferRole === "sender" ? "送信" : "受信"} / モデム:{" "}
          {selectedModemLabel}
          {transferRole === "sender"
            ? ` / データサイズ: ${formatBytes(payloadSizeBytes)}`
            : ""}{" "}
          / 経路: 実音響
        </Typography>
        {transferRole === "receiver" && (
          <Alert severity="info">
            受信端末で先に「受信待機開始」を押し、送信端末から転送を開始してください。
          </Alert>
        )}
        {isLongRun && (
          <Alert severity="warning">
            大容量データです。ggwave
            等は短文向けのため、モデム選択に注意してください。
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color={
              transferRole === "receiver" && isReceiving ? "warning" : "primary"
            }
            onClick={onRun}
            disabled={!canRun && !(transferRole === "receiver" && isReceiving)}
          >
            {primaryLabel}
          </Button>
          <Button variant="outlined" onClick={onClearResults}>
            結果をクリア
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
