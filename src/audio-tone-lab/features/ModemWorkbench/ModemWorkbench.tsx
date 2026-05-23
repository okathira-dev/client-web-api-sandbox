import type { SelectChangeEvent } from "@mui/material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef } from "react";

import { listModemCatalogEntries } from "../../domain/modems/catalog";
import type {
  ModemCatalogEntry,
  ModemId,
  ModemTuning,
  TransferActivityLog,
  TransferEstimate,
  TransferProgress,
  TransferRole,
  TuningPresetId,
} from "../../domain/modems/types";
import { formatBytes, formatSeconds } from "../../utils/format";
import { IMAGE_SAMPLE_DEFINITIONS, TEXT_SAMPLES } from "../../utils/sampleData";
import { ModemTuningPanel } from "../ModemTuningPanel";

type PayloadType = "text" | "file";

interface ModemWorkbenchProps {
  transferRole: TransferRole;
  onTransferRoleChange: (next: TransferRole) => void;
  payloadType: PayloadType;
  onPayloadTypeChange: (next: PayloadType) => void;
  textValue: string;
  onTextValueChange: (next: string) => void;
  onApplyTextSample: (sampleId: string) => void;
  selectedTextSampleId: string;
  selectedFile: File | null;
  onSelectFile: (file: File | null) => void;
  onApplyImageSample: (sampleId: string) => void;
  selectedModemId: ModemId;
  onSelectedModemIdChange: (next: ModemId) => void;
  catalogEntry: ModemCatalogEntry;
  tuning: ModemTuning;
  tuningPreset: TuningPresetId;
  onTuningPresetChange: (preset: TuningPresetId) => void;
  onTuningChange: (next: ModemTuning) => void;
  estimate: TransferEstimate | null;
  progress: TransferProgress | null;
  activityLogs: TransferActivityLog[];
  busy: boolean;
  isReceiving: boolean;
  libraryWarnings: string[];
}

const SAMPLE_TEXT_ID = "sample-text";
const SAMPLE_IMAGE_ID = "sample-image";

function formatLogTime(at: number) {
  return new Date(at).toLocaleTimeString("ja-JP", { hour12: false });
}

function phaseLabel(phase: TransferProgress["phase"]) {
  switch (phase) {
    case "encoding":
      return "符号化中";
    case "playing":
      return "再生中";
    case "listening":
      return "受信中";
    case "decoding":
      return "復号中";
    default:
      return "処理中";
  }
}

export function ModemWorkbench({
  transferRole,
  onTransferRoleChange,
  payloadType,
  onPayloadTypeChange,
  textValue,
  onTextValueChange,
  onApplyTextSample,
  selectedTextSampleId,
  selectedFile,
  onSelectFile,
  onApplyImageSample,
  selectedModemId,
  onSelectedModemIdChange,
  catalogEntry,
  tuning,
  tuningPreset,
  onTuningPresetChange,
  onTuningChange,
  estimate,
  progress,
  activityLogs,
  busy,
  isReceiving,
  libraryWarnings,
}: ModemWorkbenchProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const entries = listModemCatalogEntries();

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll when log list grows
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activityLogs.length]);

  const progressPercent =
    progress && progress.totalChunks > 0
      ? Math.min(100, (progress.processedChunks / progress.totalChunks) * 100)
      : 0;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6">端末役割</Typography>
          <RadioGroup
            row
            value={transferRole}
            onChange={(event) =>
              onTransferRoleChange(event.target.value as TransferRole)
            }
          >
            <FormControlLabel
              value="sender"
              control={<Radio />}
              label="送信モード"
              disabled={busy && isReceiving}
            />
            <FormControlLabel
              value="receiver"
              control={<Radio />}
              label="受信モード"
              disabled={busy && isReceiving}
            />
          </RadioGroup>
          <Typography variant="body2" color="text.secondary">
            {transferRole === "sender"
              ? "スピーカーから送信します。受信端末は先に待機を開始してください。"
              : "マイクで受信します。送信側と同じモデム・チューニングを選んでください。"}
          </Typography>
        </Box>

        <Divider />

        {transferRole === "sender" ? (
          <Stack spacing={2}>
            <Typography variant="h6">入力設定</Typography>
            <RadioGroup
              row
              value={payloadType}
              onChange={(event) =>
                onPayloadTypeChange(event.target.value as PayloadType)
              }
            >
              <FormControlLabel
                value="text"
                control={<Radio />}
                label="テキスト"
              />
              <FormControlLabel
                value="file"
                control={<Radio />}
                label="ファイル"
              />
            </RadioGroup>
            {payloadType === "text" ? (
              <Stack spacing={2}>
                <FormControl size="small" sx={{ maxWidth: 340 }}>
                  <InputLabel id={SAMPLE_TEXT_ID}>テキストサンプル</InputLabel>
                  <Select
                    labelId={SAMPLE_TEXT_ID}
                    label="テキストサンプル"
                    value={selectedTextSampleId}
                    onChange={(event: SelectChangeEvent) =>
                      onApplyTextSample(event.target.value)
                    }
                  >
                    {TEXT_SAMPLES.map((sample) => (
                      <MenuItem key={sample.id} value={sample.id}>
                        {sample.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="任意テキスト"
                  multiline
                  minRows={5}
                  value={textValue}
                  onChange={(event) => onTextValueChange(event.target.value)}
                  helperText={`現在 ${new TextEncoder().encode(textValue).length} bytes`}
                  fullWidth
                />
              </Stack>
            ) : (
              <Stack spacing={2}>
                <FormControl size="small" sx={{ maxWidth: 340 }}>
                  <InputLabel id={SAMPLE_IMAGE_ID}>画像サンプル</InputLabel>
                  <Select
                    labelId={SAMPLE_IMAGE_ID}
                    label="画像サンプル"
                    value=""
                    onChange={(event: SelectChangeEvent) =>
                      onApplyImageSample(event.target.value)
                    }
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>サンプルを選択</em>
                    </MenuItem>
                    {IMAGE_SAMPLE_DEFINITIONS.map((sample) => (
                      <MenuItem key={sample.id} value={sample.id}>
                        {sample.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    ファイルを選択
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    onChange={(event) => {
                      onSelectFile(event.target.files?.[0] ?? null);
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {selectedFile
                      ? `${selectedFile.name} (${formatBytes(selectedFile.size)})`
                      : "ファイル未選択"}
                  </Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            受信モードではペイロード入力は不要です。
          </Typography>
        )}

        <Divider />

        <Box>
          <Typography variant="h6">モデム選択</Typography>
          <RadioGroup
            value={selectedModemId}
            onChange={(event) =>
              onSelectedModemIdChange(event.target.value as ModemId)
            }
          >
            <Stack spacing={1.5}>
              {entries.map((entry) => {
                const selected = selectedModemId === entry.id;
                return (
                  <Paper
                    key={entry.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderColor: selected ? "primary.main" : "divider",
                    }}
                  >
                    <FormControlLabel
                      value={entry.id}
                      control={<Radio disabled={busy} />}
                      label={entry.label}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{ mt: 0.5 }}
                    >
                      <Chip size="small" label={entry.backend} />
                      <Chip size="small" label={entry.bandDescription} />
                      <Chip
                        size="small"
                        label={`堅牢 ${entry.capabilities.robustness}`}
                      />
                      {entry.capabilities.experimental && (
                        <Chip size="small" color="warning" label="実験" />
                      )}
                    </Stack>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {entry.shortDescription}
                    </Typography>
                    {selected &&
                      transferRole === "sender" &&
                      estimate !== null && (
                        <Typography variant="caption" color="text.secondary">
                          推定: {formatSeconds(estimate.expectedSeconds)}
                        </Typography>
                      )}
                  </Paper>
                );
              })}
            </Stack>
          </RadioGroup>
        </Box>

        <ModemTuningPanel
          entry={catalogEntry}
          tuning={tuning}
          preset={tuningPreset}
          onPresetChange={onTuningPresetChange}
          onTuningChange={onTuningChange}
          disabled={busy}
        />

        {busy && progress && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {phaseLabel(progress.phase)}
            </Typography>
            <LinearProgress variant="determinate" value={progressPercent} />
          </Box>
        )}

        {(activityLogs.length > 0 || isReceiving) && (
          <Box>
            <Typography variant="h6" gutterBottom>
              活動ログ
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                maxHeight: 220,
                overflowY: "auto",
                bgcolor: "grey.50",
              }}
            >
              <Typography
                component="pre"
                variant="caption"
                sx={{ m: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}
              >
                {activityLogs
                  .map(
                    (entry) =>
                      `${formatLogTime(entry.at)} [${entry.level}] ${entry.message}`,
                  )
                  .join("\n") || "待機中…"}
              </Typography>
              <Box ref={logEndRef} />
            </Paper>
          </Box>
        )}

        {libraryWarnings.length > 0 && (
          <Alert severity="warning">
            {libraryWarnings.map((w) => (
              <Typography key={w} variant="caption" display="block">
                {w}
              </Typography>
            ))}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}
