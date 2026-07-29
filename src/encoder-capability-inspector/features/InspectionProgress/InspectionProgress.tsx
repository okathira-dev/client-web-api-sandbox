import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import {
  useCurrentInspection,
  useEnvironment,
  useFamilySummaries,
  useProgress,
  useResultCounts,
} from "../../atoms/report";
import { useIsRunning } from "../../atoms/runState";
import type { VideoFamily } from "../../domain/types";
import { formatDuration } from "../../utils/format";

const FAMILY_LABELS: Record<VideoFamily, string> = {
  h264: "H.264 / AVC",
  h265: "H.265 / HEVC",
  vp9: "VP9",
  av1: "AV1",
  vp8: "VP8",
};

const STATUS_LABELS: Record<string, string> = {
  running: "実行中",
  complete: "完了",
  cancelled: "中断",
  failed: "失敗",
};

/** 候補を処理していないときの状態表示。未開始・待機・完了・中断・失敗を区別する（仕様 3.4）。 */
const IDLE_MESSAGES: Record<string, string> = {
  idle: "包括検査を開始すると、候補ごとの結果がここに表示されます",
  waiting: "次の候補を待機しています",
  running: "次の候補を待機しています",
  complete: "すべての候補を処理しました",
  cancelled: "検査を中断しました。再開すると残りの候補から続けられます",
  failed: "検査が完了前に停止しました",
};

const STAGE_LABELS: Record<string, string> = {
  declared: "設定の受理を確認中",
  output: "エンコード中",
  decode: "デコード検証中",
  mux: "多重化中",
  complete: "完了",
};

/** 経過時間を秒単位で進めるためだけの時計。結果一覧とは別コンポーネントに閉じる。 */
const useTicker = (active: boolean) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [active]);
  return now;
};

export const InspectionProgress = () => {
  const progress = useProgress();
  const current = useCurrentInspection();
  const counts = useResultCounts();
  const families = useFamilySummaries();
  const environment = useEnvironment();
  const running = useIsRunning();
  const now = useTicker(running);

  const elapsedMs = progress.startedAt
    ? (progress.completedAt ?? now) - progress.startedAt
    : 0;
  const averageMs =
    progress.completedUnits > 0 ? elapsedMs / progress.completedUnits : 0;
  const remainingUnits = Math.max(
    0,
    progress.totalUnits - progress.completedUnits,
  );
  const etaMs = running && averageMs > 0 ? averageMs * remainingUnits : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          mb={1}
        >
          <Typography variant="subtitle1" component="h2">
            {progress.status
              ? (STATUS_LABELS[progress.status] ?? progress.status)
              : "未実行"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {progress.completedUnits} / {progress.totalUnits || "—"} 候補
          </Typography>
        </Stack>

        <LinearProgress
          variant={progress.totalUnits > 0 ? "determinate" : "indeterminate"}
          value={
            progress.totalUnits > 0
              ? (progress.completedUnits / progress.totalUnits) * 100
              : 0
          }
          sx={{ mb: 1.5 }}
        />

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1.5}>
          <Chip size="small" label={`経過 ${formatDuration(elapsedMs)}`} />
          <Chip
            size="small"
            label={`残り見込み ${etaMs === null ? "—" : formatDuration(etaMs)}`}
          />
          <Chip size="small" color="success" label={`成功 ${counts.pass}`} />
          <Chip size="small" color="warning" label={`警告 ${counts.warning}`} />
          <Chip size="small" color="error" label={`失敗 ${counts.fail}`} />
          <Chip
            size="small"
            variant="outlined"
            label={`候補間待機 ${progress.candidatePauseMs} ms`}
          />
        </Stack>

        {/* 候補と候補の間でも表示領域を消さず、いま何をしているかを示し続ける。 */}
        <Box
          aria-live="polite"
          sx={{
            minHeight: 44,
            px: 1.5,
            py: 1,
            borderRadius: 1,
            bgcolor: "action.hover",
            mb: 2,
          }}
        >
          {current ? (
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip
                size="small"
                label={STAGE_LABELS[current.stage] ?? current.stage}
              />
              <Typography variant="body2" fontFamily="monospace">
                {current.codec}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {current.label}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {IDLE_MESSAGES[running ? "waiting" : (progress.status ?? "idle")]}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" component="h3" gutterBottom>
          コーデックファミリー
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={1}>
          {families.map((family) => (
            <Chip
              key={family.family}
              size="small"
              variant={family.complete ? "filled" : "outlined"}
              color={
                !family.complete
                  ? "default"
                  : family.unavailable
                    ? "error"
                    : "success"
              }
              label={
                family.complete
                  ? `${FAMILY_LABELS[family.family]}: ${family.usableCount} / ${family.totalCount}`
                  : `${FAMILY_LABELS[family.family]}: 未検査`
              }
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          分母は experimental 扱い（10bit・Level 6.x など）を除いた codec string
          の数です。 完全に完了した検査の結果だけを集計します。
        </Typography>

        {environment && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1.5}
          >
            実行環境: {environment.browserBrands ?? environment.userAgent}
            {environment.platform && ` · ${environment.platform}`}
            {environment.gpu?.vendor &&
              ` · GPU ${environment.gpu.vendor}${
                environment.gpu.architecture
                  ? ` (${environment.gpu.architecture})`
                  : ""
              }`}
            {environment.hardwareConcurrency &&
              ` · ${environment.hardwareConcurrency} 論理コア`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
