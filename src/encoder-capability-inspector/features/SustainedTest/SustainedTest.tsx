import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  useCandidatePauseMs,
  useSetSustainedDurationInput,
  useSetSustainedInputMode,
  useSustainedDurationInput,
  useSustainedDurationSeconds,
  useSustainedInputMode,
} from "../../atoms/preferences";
import { useResults, useSustainedState } from "../../atoms/report";
import { useIsRunning } from "../../atoms/runState";
import {
  MAX_SUSTAINED_DURATION_SECONDS,
  MIN_SUSTAINED_DURATION_SECONDS,
} from "../../consts/inspection";
import { useInspectionControls } from "../InspectionRunner";
import { useSelectedIds, useSetSelection } from "../ResultTable";
import { acquireLiveCapture } from "./functions";

const STATUS_LABELS: Record<string, string> = {
  running: "実行中",
  complete: "完了",
  cancelled: "中断",
  failed: "失敗",
};

export const SustainedTest = () => {
  const results = useResults();
  const selectedIds = useSelectedIds();
  const setSelection = useSetSelection();
  const running = useIsRunning();
  const sustained = useSustainedState();
  const candidatePauseMs = useCandidatePauseMs();
  const inputMode = useSustainedInputMode();
  const setInputMode = useSetSustainedInputMode();
  const durationInput = useSustainedDurationInput();
  const setDurationInput = useSetSustainedDurationInput();
  const durationSeconds = useSustainedDurationSeconds();
  const { startSustained } = useInspectionControls();
  const [captureError, setCaptureError] = useState<string | null>(null);

  const selectedResults = results.filter((result) =>
    selectedIds.has(result.id),
  );
  const hasAudioSelection = selectedResults.some(
    (result) => result.kind !== "video",
  );
  const liveWithAudio = inputMode === "live" && hasAudioSelection;
  const durationInvalid = durationSeconds === null;
  const canRun =
    !running &&
    selectedResults.length > 0 &&
    !durationInvalid &&
    candidatePauseMs !== null &&
    !liveWithAudio;

  const run = async () => {
    if (!canRun || durationSeconds === null || candidatePauseMs === null)
      return;
    setCaptureError(null);
    let liveCapture = null;
    if (inputMode === "live") {
      try {
        liveCapture = await acquireLiveCapture();
      } catch (error) {
        setCaptureError(error instanceof Error ? error.message : String(error));
        return;
      }
    }
    await startSustained({
      unitIds: selectedResults.map((result) => result.id),
      durationSeconds,
      candidatePauseMs,
      inputMode,
      liveCapture,
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" component="h2" gutterBottom>
          Sustained test（継続検査）
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          選択した具体的な設定を、指定した時間ぶんだけ実出力・デコード・多重化まで通して
          検査します。単発の少数フレーム結果では分からない継続性能を確認するためのものです。
          ライブ入力はブラウザーの画面共有ダイアログを開きますが、
          <strong>録画ファイルは一切作成しません</strong>。
        </Typography>

        {captureError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            画面キャプチャを取得できませんでした: {captureError}
          </Alert>
        )}
        {liveWithAudio && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ライブ入力は映像フレームしか供給できないため、音声候補は対象外です。
            音声候補の選択を外すか、入力を「合成パターン」に切り替えてください。
          </Alert>
        )}

        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          alignItems="flex-start"
        >
          <TextField
            select
            size="small"
            label="入力"
            value={inputMode}
            disabled={running}
            onChange={(event) => {
              setInputMode(
                event.target.value === "live" ? "live" : "synthetic",
              );
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="synthetic">合成パターン（再現可能）</MenuItem>
            <MenuItem value="live">画面・タブのキャプチャ</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="number"
            label="検査時間（秒）"
            value={durationInput}
            disabled={running}
            error={durationInvalid}
            helperText={
              durationInvalid
                ? `${MIN_SUSTAINED_DURATION_SECONDS}〜${MAX_SUSTAINED_DURATION_SECONDS} 秒`
                : " "
            }
            slotProps={{
              htmlInput: {
                min: MIN_SUSTAINED_DURATION_SECONDS,
                max: MAX_SUSTAINED_DURATION_SECONDS,
                step: 1,
              },
            }}
            onChange={(event) => {
              setDurationInput(event.target.value);
            }}
            sx={{ minWidth: 160 }}
          />

          <Button
            variant="contained"
            disabled={!canRun}
            onClick={() => {
              void run();
            }}
          >
            選択した {selectedResults.length} 件を継続検査
          </Button>

          <Button
            variant="outlined"
            disabled={running}
            onClick={() => {
              setSelection(
                results
                  .filter((result) => result.kind === "video" && result.usable)
                  .map((result) => result.id),
              );
            }}
          >
            成功した映像設定を選択
          </Button>

          <Button
            variant="text"
            disabled={running || selectedIds.size === 0}
            onClick={() => {
              setSelection([]);
            }}
          >
            選択を解除
          </Button>
        </Stack>

        {sustained && (
          <Box mt={2}>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              alignItems="center"
            >
              <Chip
                size="small"
                label={`継続検査 ${STATUS_LABELS[sustained.status] ?? sustained.status}`}
              />
              <Typography variant="body2" color="text.secondary">
                {sustained.completedUnits} / {sustained.totalUnits} 件 ·{" "}
                {sustained.durationSeconds} 秒 ·{" "}
                {sustained.inputMode === "live" ? "ライブ入力" : "合成入力"}
              </Typography>
              {sustained.current && (
                <Typography variant="body2" fontFamily="monospace">
                  {sustained.current.codec} / {sustained.current.stage}
                </Typography>
              )}
            </Stack>
            {sustained.error && (
              <Typography variant="body2" color="error" mt={0.5}>
                {sustained.error}
              </Typography>
            )}
            {sustained.source && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                入力: {sustained.source.width ?? "?"}×
                {sustained.source.height ?? "?"}
                {" @ "}
                {sustained.source.frameRate ?? "?"} fps
                {sustained.source.displaySurface &&
                  ` · ${sustained.source.displaySurface}`}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
