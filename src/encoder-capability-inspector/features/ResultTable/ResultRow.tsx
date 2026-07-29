import { Box, Checkbox, Chip, Tooltip, Typography } from "@mui/material";
import { memo } from "react";

import {
  getResultDetails,
  getResultStatus,
  getResultVariant,
} from "../../domain/filters";
import type { UnitResult, VideoFamily } from "../../domain/types";
import { formatFrameBudget, formatMilliseconds } from "../../utils/format";
import { RESULT_GRID_TEMPLATE, RESULT_ROW_HEIGHT } from "./consts";

const FAMILY_LABELS: Record<string, string> = {
  h264: "H.264",
  h265: "H.265",
  vp9: "VP9",
  av1: "AV1",
  vp8: "VP8",
  aac: "AAC",
  opus: "Opus",
} satisfies Record<VideoFamily | string, string>;

const STATUS_CHIP = {
  pass: { label: "成功", color: "success" },
  warning: { label: "成功/警告", color: "warning" },
  fail: { label: "失敗", color: "error" },
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
  readonly selectionDisabled: boolean;
  readonly onToggle: (unitId: string) => void;
  readonly style: React.CSSProperties;
};

/**
 * 完了した行は結果オブジェクトが差し替わらない限り再描画しない。
 * ステージ更新のたびに 480 行ぶんの再計算が走ると、検査中の操作が重くなる。
 */
export const ResultRow = memo(
  ({
    result,
    selected,
    selectionDisabled,
    onToggle,
    style,
  }: ResultRowProps) => {
    const status = getResultStatus(result);
    const chip = STATUS_CHIP[status];
    const details = getResultDetails(result);
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
            disabled={selectionDisabled}
            inputProps={{
              "aria-label": `${result.codec} を Sustained test の対象にする`,
            }}
            onChange={() => {
              onToggle(result.id);
            }}
          />
        </Box>
        <Box role="cell">
          <CellText>{FAMILY_LABELS[result.family] ?? result.family}</CellText>
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
          <Chip size="small" color={chip.color} label={chip.label} />
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
              設定は受理されたが {result.stage} で失敗
            </Typography>
          )}
        </Box>
        <Box role="cell" sx={{ overflow: "hidden" }}>
          <CellText>基本: {formatFrameBudget(result.performance)}</CellText>
          {sustained ? (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              display="block"
            >
              継続 {sustained.usable ? "成功" : "失敗"}:{" "}
              {formatFrameBudget(sustained.performance)}
            </Typography>
          ) : (
            result.kind === "video" &&
            result.source && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                入力 {result.source.width ?? "?"}×{result.source.height ?? "?"}{" "}
                @ {result.source.frameRate ?? "?"} fps · 欠落{" "}
                {result.source.missingInputFrames}
              </Typography>
            )
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
