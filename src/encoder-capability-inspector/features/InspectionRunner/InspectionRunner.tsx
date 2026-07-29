import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";

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
import { subscribeReportChanged } from "../../utils/reportStore";
import { useInspectionControls } from "./hooks";

export const InspectionRunner = () => {
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
          エンコーダー実用可否検査
        </Typography>
        <Typography variant="body2" color="text.secondary">
          列挙したすべての codec string / Profile / Level
          について、実際にエンコード・
          デコード・多重化まで通して実用可否を確認します。`isConfigSupported`
          が受理しただけの設定は「利用可能」として扱いません。結果はこの環境
          （ブラウザー・OS・GPU・ドライバーの組み合わせ）に固有のもので、
          すべての録画条件での成功を保証するものではありません。
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {report?.status === "complete" && (
        <Alert severity="success">
          包括検査が完了しました。この結果はこの環境で一度実出力まで到達したことを示します。
        </Alert>
      )}
      {report?.status === "cancelled" && (
        <Alert severity="info">
          検査を中断しました。途中結果は環境の結論としては扱われません。
          直前に完全完了した結果があればそちらが有効なままです。
        </Alert>
      )}
      {report?.status === "failed" && (
        <Alert severity="warning">
          検査が完了前に停止しました: {report.error ?? "不明な理由"}
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
          {report ? "すべて再検査" : "包括検査を開始"}
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
            途中から再開（残り {report.totalUnits - report.completedUnits} 件）
          </Button>
        )}

        {running && (
          <Button color="error" variant="outlined" onClick={cancel}>
            {runKind === "sustained" ? "Sustained test を中止" : "検査を中止"}
          </Button>
        )}

        <Button
          variant="outlined"
          disabled={running || !report}
          onClick={() => {
            void reset();
          }}
        >
          結果を破棄
        </Button>

        <TextField
          label="候補間の待機 (ms)"
          size="small"
          type="number"
          disabled={running}
          value={candidatePauseInput}
          error={pauseInvalid}
          helperText={
            pauseInvalid
              ? `0〜${MAX_CANDIDATE_PAUSE_MS} の整数で指定してください`
              : `既定 ${DEFAULT_CANDIDATE_PAUSE_MS} ms。0 のとき待機処理を行いません`
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
