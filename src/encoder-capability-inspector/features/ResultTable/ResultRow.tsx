import { Box, Checkbox, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { MediaKindIcon } from "../../components/MediaKindIcon";
import type { BackendInference } from "../../domain/backendInference";
import { getFamilyKind } from "../../domain/families";
import { getResultStatus, getResultVariant } from "../../domain/filters";
import type { UnitResult } from "../../domain/types";
import { formatFrameBudget, formatMilliseconds } from "../../utils/format";
import { useResultDetailLines } from "../../utils/messages";
import { RESULT_GRID_TEMPLATE, RESULT_ROW_HEIGHT } from "./consts";

/** 推定の根拠を説明する文。何を突き合わせて決まったかで分ける。 */
const BACKEND_REASON_KEYS = {
  "output-match": "table.backendReasonMatched",
  "only-one-worked": "table.backendReasonOnlyOne",
  unknown: "table.backendReasonUnknown",
} as const;

const getBackendReasonKey = (backend: BackendInference): string =>
  BACKEND_REASON_KEYS[backend.basis ?? "unknown"];

const STATUS_CHIP = {
  pass: { key: "table.statusPass", color: "success" },
  warning: { key: "table.statusWarning", color: "warning" },
  fail: { key: "table.statusFail", color: "error" },
} as const;

const CellText = ({
  children,
  title,
  mono = false,
}: {
  children: React.ReactNode;
  title?: string;
  mono?: boolean;
}) => (
  <Typography
    variant="body2"
    title={title}
    sx={{
      fontFamily: mono ? "monospace" : undefined,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </Typography>
);

const CaptionText = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="caption" color="text.secondary" noWrap display="block">
    {children}
  </Typography>
);

type ResultRowProps = {
  readonly result: UnitResult;
  readonly selected: boolean;
  /** `no-preference` の実体推定。対象外の行では渡さない。 */
  readonly backend: BackendInference | undefined;
  readonly onToggle: (unitId: string) => void;
  readonly style: React.CSSProperties;
};

/**
 * 完了した行は結果オブジェクトが差し替わらない限り再描画しない。
 * ステージ更新のたびに 484 行ぶんの再計算が走ると、検査中の操作が重くなる。
 * 言語切り替えは `useTranslation` 側の購読で全行に伝わるので、memo と両立する。
 */
export const ResultRow = memo(
  ({ result, selected, backend, onToggle, style }: ResultRowProps) => {
    const { t } = useTranslation();
    const describeDetails = useResultDetailLines();
    const status = getResultStatus(result);
    const chip = STATUS_CHIP[status];
    const details = describeDetails(result);
    const sustained = result.sustained;
    const experimentalReasons =
      result.kind === "video" && result.experimental
        ? result.experimentalReasons
        : [];

    return (
      <Box
        role="row"
        style={style}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: RESULT_ROW_HEIGHT,
          display: "grid",
          gridTemplateColumns: RESULT_GRID_TEMPLATE,
          alignItems: "center",
          columnGap: 1,
          px: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box role="cell">
          <Checkbox
            size="small"
            checked={selected}
            inputProps={{
              "aria-label": t("table.selectOne", { codec: result.codec }),
            }}
            onChange={() => {
              onToggle(result.id);
            }}
          />
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <MediaKindIcon kind={getFamilyKind(result.family)} />
            <CellText>
              {t(`family.${result.family}`, { defaultValue: result.family })}
            </CellText>
          </Stack>
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CellText mono title={result.codec}>
              {result.codec}
            </CellText>
            {experimentalReasons.length > 0 && (
              <Tooltip
                title={experimentalReasons
                  .map((reason) => t(`experimental.${reason}`))
                  .join(" · ")}
                placement="top"
              >
                <Chip
                  size="small"
                  variant="outlined"
                  color="warning"
                  label={t("table.experimentalBadge")}
                  sx={{ height: 18, "& .MuiChip-label": { px: 0.75 } }}
                />
              </Tooltip>
            )}
          </Stack>
          <CaptionText>{result.label}</CaptionText>
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <CellText>{getResultVariant(result)}</CellText>
          {/*
            列幅に収まる短い印だけを出し、根拠と方法はツールチップへ回す。
            文章のまま置くと省略記号で切れて、何も読み取れなくなる。
          */}
          {backend && (
            <Tooltip
              title={`${t(getBackendReasonKey(backend), {
                backend: t(`table.backend_${backend.verdict}`),
              })} ${t("table.backendHint")}`}
              placement="top"
            >
              <Chip
                size="small"
                variant="outlined"
                color={backend.verdict === "unknown" ? "default" : "info"}
                label={
                  backend.verdict === "unknown"
                    ? t("table.backendUnknownShort")
                    : t("table.backendShort", {
                        backend: t(`table.backend_${backend.verdict}`),
                      })
                }
                // 他の補足文と同じ大きさにする。列幅には収まる。
                sx={{
                  height: 20,
                  "& .MuiChip-label": { px: 0.75, fontSize: 12 },
                }}
              />
            </Tooltip>
          )}
        </Box>
        <Box role="cell">
          <Chip size="small" color={chip.color} label={t(chip.key)} />
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <Tooltip
            title={[details.codes, details.explanation]
              .filter(Boolean)
              .join(" — ")}
            placement="top"
          >
            <span>
              <CellText mono>{details.codes || "—"}</CellText>
            </span>
          </Tooltip>
          {details.explanation && (
            <CaptionText>{details.explanation}</CaptionText>
          )}
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <CellText>{formatFrameBudget(result.performance)}</CellText>
          {result.kind === "video" && result.source && (
            <CaptionText>
              {t("table.sourceLine", {
                width: result.source.width ?? "?",
                height: result.source.height ?? "?",
                fps: result.source.frameRate ?? "?",
                missing: result.source.missingInputFrames,
              })}
            </CaptionText>
          )}
          {result.kind === "audio" && result.source && (
            <CaptionText>
              {t("sustained.audioSourceLine", {
                channels: result.source.channelCount ?? "?",
                sampleRate: result.source.sampleRate ?? "?",
              })}
            </CaptionText>
          )}
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          {sustained ? (
            <>
              <CellText>{formatFrameBudget(sustained.performance)}</CellText>
              <Typography
                variant="caption"
                color={sustained.usable ? "success.main" : "error.main"}
                noWrap
                display="block"
              >
                {sustained.usable
                  ? t("table.statusPass")
                  : t("table.statusFail")}
                {sustained.performance &&
                  ` · ${t("table.sustainedFrames", {
                    count: sustained.performance.frameCount,
                  })}`}
              </Typography>
            </>
          ) : (
            <CellText>—</CellText>
          )}
        </Box>
        <Box role="cell">
          <CellText>{formatMilliseconds(result.elapsedMs)}</CellText>
        </Box>
      </Box>
    );
  },
);

ResultRow.displayName = "ResultRow";
