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
import { useTranslation } from "react-i18next";

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
import { useCodeMessage } from "../../utils/messages";
import { useInspectionControls } from "../InspectionRunner";
import { useSelectedIds, useSetSelection } from "../ResultTable";
import { acquireLiveCapture } from "./functions";

export const SustainedTest = () => {
  const { t } = useTranslation();
  const describeCode = useCodeMessage();
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
  /** 直前のライブ入力で実際に取れた音声の素性。モノラルに落ちていないかを見せる。 */
  const capturedAudio = sustained?.source?.audio ?? null;

  const selectedResults = results.filter((result) =>
    selectedIds.has(result.id),
  );
  const hasAudioSelection = selectedResults.some(
    (result) => result.kind === "audio",
  );
  const durationInvalid = durationSeconds === null;
  const canRun =
    !running &&
    selectedResults.length > 0 &&
    !durationInvalid &&
    candidatePauseMs !== null;

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
          {t("sustained.heading")}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {t("sustained.description")}
        </Typography>

        {captureError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("sustained.captureFailed", {
              reason: describeCode(captureError),
            })}
          </Alert>
        )}
        {inputMode === "live" && hasAudioSelection && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t("sustained.liveAudioNote")}
          </Alert>
        )}
        {capturedAudio && capturedAudio.channelCount === 1 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {t("sustained.liveAudioMono")}
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
            label={t("sustained.inputLabel")}
            value={inputMode}
            disabled={running}
            onChange={(event) => {
              setInputMode(
                event.target.value === "live" ? "live" : "synthetic",
              );
            }}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="synthetic">
              {t("sustained.inputSynthetic")}
            </MenuItem>
            <MenuItem value="live">{t("sustained.inputLive")}</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="number"
            label={t("sustained.durationLabel")}
            value={durationInput}
            disabled={running}
            error={durationInvalid}
            helperText={
              durationInvalid
                ? t("sustained.durationInvalid", {
                    min: MIN_SUSTAINED_DURATION_SECONDS,
                    max: MAX_SUSTAINED_DURATION_SECONDS,
                  })
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
            {t("sustained.run", { count: selectedResults.length })}
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
            {t("sustained.selectPassedVideo")}
          </Button>

          <Button
            variant="text"
            disabled={running || selectedIds.size === 0}
            onClick={() => {
              setSelection([]);
            }}
          >
            {t("sustained.clearSelection")}
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
                label={t("sustained.statusChip", {
                  status: t(`runStatus.${sustained.status}`, {
                    defaultValue: sustained.status,
                  }),
                })}
              />
              <Typography variant="body2" color="text.secondary">
                {t("sustained.statusDetail", {
                  completed: sustained.completedUnits,
                  total: sustained.totalUnits,
                  seconds: sustained.durationSeconds,
                  input:
                    sustained.inputMode === "live"
                      ? t("sustained.inputLive")
                      : t("sustained.inputSynthetic"),
                })}
              </Typography>
              {sustained.current && (
                <Typography variant="body2" fontFamily="monospace">
                  {sustained.current.codec} / {sustained.current.stage}
                </Typography>
              )}
            </Stack>
            {sustained.error && (
              <Typography variant="body2" color="error" mt={0.5}>
                {describeCode(sustained.error)}
              </Typography>
            )}
            {sustained.source && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                {t("sustained.sourceLine", {
                  width: sustained.source.width ?? "?",
                  height: sustained.source.height ?? "?",
                  fps: sustained.source.frameRate ?? "?",
                })}
                {sustained.source.displaySurface &&
                  ` · ${sustained.source.displaySurface}`}
                {" · "}
                {capturedAudio
                  ? t("sustained.audioSourceLine", {
                      channels: capturedAudio.channelCount ?? "?",
                      sampleRate: capturedAudio.sampleRate ?? "?",
                    })
                  : t("sustained.audioSourceNone")}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
