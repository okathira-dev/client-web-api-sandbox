import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  useCandidatePauseInput,
  useCandidatePauseMs,
  useSetCandidatePauseInput,
} from "../../atoms/preferences";
import { useReport } from "../../atoms/report";
import { useIsRunning, useRunError, useRunKind } from "../../atoms/runState";
import {
  DEFAULT_CANDIDATE_PAUSE_MS,
  MAX_CANDIDATE_PAUSE_MS,
} from "../../consts/inspection";
import { isResumableReport } from "../../domain/report";
import { useCodeMessage } from "../../utils/messages";
import { subscribeReportChanged } from "../../utils/reportStore";
import { useInspectionControls } from "./hooks";

export const InspectionRunner = () => {
  const { t } = useTranslation();
  const describeCode = useCodeMessage();
  const report = useReport();
  const running = useIsRunning();
  const runKind = useRunKind();
  const error = useRunError();
  const candidatePauseInput = useCandidatePauseInput();
  const setCandidatePauseInput = useSetCandidatePauseInput();
  const candidatePauseMs = useCandidatePauseMs();
  const { startFull, cancel, reset, reload } = useInspectionControls();

  useEffect(() => {
    void reload();
  }, [reload]);

  // 別タブが検査を終えたら、こちらの表示も保存済みの内容に追従させる。
  useEffect(
    () =>
      subscribeReportChanged(() => {
        void reload();
      }),
    [reload],
  );

  const pauseInvalid = candidatePauseMs === null;
  const resumable = isResumableReport(report);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" component="h1" gutterBottom>
          {t("app.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("app.description")}
        </Typography>
      </Box>

      {error && <Alert severity="error">{describeCode(error)}</Alert>}

      {report?.status === "complete" && (
        <Alert severity="success">{t("runner.completed")}</Alert>
      )}
      {report?.status === "cancelled" && (
        <Alert severity="info">{t("runner.cancelled")}</Alert>
      )}
      {report?.status === "failed" && (
        <Alert severity="warning">
          {t("runner.failed", {
            reason: report.error
              ? describeCode(report.error)
              : t("runner.unknownReason"),
          })}
        </Alert>
      )}

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          disabled={running || pauseInvalid}
          onClick={() => {
            if (candidatePauseMs === null) return;
            void startFull({ candidatePauseMs, resume: false });
          }}
        >
          {report ? t("runner.rerun") : t("runner.start")}
        </Button>

        {resumable && (
          <Button
            variant="outlined"
            disabled={running || pauseInvalid}
            onClick={() => {
              if (candidatePauseMs === null) return;
              void startFull({ candidatePauseMs, resume: true });
            }}
          >
            {t("runner.resume", {
              count: report.totalUnits - report.completedUnits,
            })}
          </Button>
        )}

        {running && (
          <Button color="error" variant="outlined" onClick={cancel}>
            {runKind === "sustained"
              ? t("runner.cancelSustained")
              : t("runner.cancelFull")}
          </Button>
        )}

        <Button
          variant="outlined"
          disabled={running || !report}
          onClick={() => {
            void reset();
          }}
        >
          {t("runner.reset")}
        </Button>

        <TextField
          label={t("runner.pauseLabel")}
          size="small"
          type="number"
          disabled={running}
          value={candidatePauseInput}
          error={pauseInvalid}
          helperText={
            pauseInvalid
              ? t("runner.pauseInvalid", { max: MAX_CANDIDATE_PAUSE_MS })
              : t("runner.pauseHelp", { default: DEFAULT_CANDIDATE_PAUSE_MS })
          }
          slotProps={{
            htmlInput: { min: 0, max: MAX_CANDIDATE_PAUSE_MS, step: 50 },
          }}
          onChange={(event) => {
            setCandidatePauseInput(event.target.value);
          }}
          sx={{ minWidth: 260 }}
        />
      </Stack>
    </Stack>
  );
};
