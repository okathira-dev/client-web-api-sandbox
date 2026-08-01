import { Box, Checkbox, Chip, Tooltip, Typography } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { getResultStatus, getResultVariant } from "../../domain/filters";
import type { UnitResult } from "../../domain/types";
import { formatFrameBudget, formatMilliseconds } from "../../utils/format";
import { useResultDetails } from "../../utils/messages";
import { RESULT_GRID_TEMPLATE, RESULT_ROW_HEIGHT } from "./consts";

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

type ResultRowProps = {
  readonly result: UnitResult;
  readonly selected: boolean;
  readonly onToggle: (unitId: string) => void;
  readonly style: React.CSSProperties;
};

/**
 * 完了した行は結果オブジェクトが差し替わらない限り再描画しない。
 * ステージ更新のたびに 480 行ぶんの再計算が走ると、検査中の操作が重くなる。
 * 言語切り替えは `useTranslation` 側の購読で全行に伝わるので、memo と両立する。
 */
export const ResultRow = memo(
  ({ result, selected, onToggle, style }: ResultRowProps) => {
    const { t } = useTranslation();
    const describeDetails = useResultDetails();
    const status = getResultStatus(result);
    const chip = STATUS_CHIP[status];
    const details = describeDetails(result);
    const sustained = result.sustained;

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
        <Box role="cell">
          <CellText>
            {t(`family.${result.family}`, { defaultValue: result.family })}
          </CellText>
        </Box>
        <Box role="cell">
          <CellText mono title={result.codec}>
            {result.codec}
          </CellText>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            display="block"
          >
            {result.label}
          </Typography>
        </Box>
        <Box role="cell">
          <CellText>{getResultVariant(result)}</CellText>
        </Box>
        <Box role="cell">
          <Chip size="small" color={chip.color} label={t(chip.key)} />
        </Box>
        <Box role="cell">
          <Tooltip title={details || ""} placement="top">
            <span>
              <CellText>{details || "—"}</CellText>
            </span>
          </Tooltip>
          {result.declared && !result.usable && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {t("table.declaredButFailed", { stage: result.stage })}
            </Typography>
          )}
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <CellText>{formatFrameBudget(result.performance)}</CellText>
          {result.kind === "video" && result.source && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              {t("table.sourceLine", {
                width: result.source.width ?? "?",
                height: result.source.height ?? "?",
                fps: result.source.frameRate ?? "?",
                missing: result.source.missingInputFrames,
              })}
            </Typography>
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
