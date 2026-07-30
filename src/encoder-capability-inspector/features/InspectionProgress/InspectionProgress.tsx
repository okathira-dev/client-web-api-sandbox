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
import { useTranslation } from "react-i18next";

import {
  useCurrentInspection,
  useEnvironment,
  useFamilySummaries,
  useProgress,
  useResultCounts,
} from "../../atoms/report";
import { useIsRunning } from "../../atoms/runState";
import { formatDuration } from "../../utils/format";

/** 候補を処理していないときの状態表示。未開始・待機・完了・中断・失敗を区別する（仕様 3.4）。 */
const IDLE_KEYS: Record<string, string> = {
  idle: "idle",
  waiting: "waiting",
  running: "waiting",
  complete: "complete",
  cancelled: "cancelled",
  failed: "failed",
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
  const { t } = useTranslation();
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
              ? t(`runStatus.${progress.status}`, {
                  defaultValue: progress.status,
                })
              : t("runStatus.notStarted")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("progress.unitCount", {
              completed: progress.completedUnits,
              total: progress.totalUnits || "—",
            })}
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
          <Chip
            size="small"
            label={t("progress.elapsed", { value: formatDuration(elapsedMs) })}
          />
          <Chip
            size="small"
            label={t("progress.eta", {
              value: etaMs === null ? "—" : formatDuration(etaMs),
            })}
          />
          <Chip
            size="small"
            color="success"
            label={t("progress.pass", { count: counts.pass })}
          />
          <Chip
            size="small"
            color="warning"
            label={t("progress.warning", { count: counts.warning })}
          />
          <Chip
            size="small"
            color="error"
            label={t("progress.fail", { count: counts.fail })}
          />
          <Chip
            size="small"
            variant="outlined"
            label={t("progress.pause", { value: progress.candidatePauseMs })}
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
                label={t(`progress.stage.${current.stage}`, {
                  defaultValue: current.stage,
                })}
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
              {t(
                `progress.idle.${
                  IDLE_KEYS[
                    running ? "waiting" : (progress.status ?? "idle")
                  ] ?? "idle"
                }`,
              )}
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle2" component="h3" gutterBottom>
          {t("progress.familyHeading")}
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
                  ? t("progress.familyRatio", {
                      family: t(`family.${family.family}`),
                      usable: family.usableCount,
                      total: family.totalCount,
                    })
                  : t("progress.familyUntested", {
                      family: t(`family.${family.family}`),
                    })
              }
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          {t("progress.familyNote")}
        </Typography>

        {environment && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1.5}
          >
            {t("progress.environment")}:{" "}
            {environment.browserBrands ?? environment.userAgent}
            {environment.platform && ` · ${environment.platform}`}
            {environment.gpu?.vendor &&
              ` · GPU ${environment.gpu.vendor}${
                environment.gpu.architecture
                  ? ` (${environment.gpu.architecture})`
                  : ""
              }`}
            {environment.hardwareConcurrency &&
              ` · ${t("progress.cores", {
                count: environment.hardwareConcurrency,
              })}`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
