import { Box, Checkbox, MenuItem, TextField, Typography } from "@mui/material";

import type { ResultFilters } from "../../domain/filters";
import { RESULT_GRID_TEMPLATE } from "./consts";

const FAMILY_LABELS: Record<string, string> = {
  h264: "H.264",
  h265: "H.265",
  vp9: "VP9",
  av1: "AV1",
  vp8: "VP8",
  aac: "AAC",
  opus: "Opus",
};

const HeaderCell = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" noWrap>
      {label}
    </Typography>
    {children}
  </Box>
);

const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <TextField
    select
    size="small"
    label={label}
    value={value}
    onChange={(event) => {
      onChange(event.target.value);
    }}
    slotProps={{ inputLabel: { shrink: true } }}
    sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
  >
    <MenuItem value="">すべて</MenuItem>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

export type ResultTableHeaderProps = {
  readonly filters: ResultFilters;
  readonly familyOptions: readonly string[];
  readonly variantOptions: readonly string[];
  readonly allSelected: boolean;
  readonly someSelected: boolean;
  readonly selectionDisabled: boolean;
  readonly onFilterChange: (field: keyof ResultFilters, value: string) => void;
  readonly onToggleAll: () => void;
};

export const ResultTableHeader = ({
  filters,
  familyOptions,
  variantOptions,
  allSelected,
  someSelected,
  selectionDisabled,
  onFilterChange,
  onToggleAll,
}: ResultTableHeaderProps) => (
  <Box
    role="row"
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 2,
      display: "grid",
      gridTemplateColumns: RESULT_GRID_TEMPLATE,
      alignItems: "end",
      columnGap: 1,
      px: 1,
      py: 1,
      bgcolor: "background.paper",
      borderBottom: 2,
      borderColor: "divider",
    }}
  >
    <Box>
      <Checkbox
        size="small"
        checked={allSelected}
        indeterminate={someSelected}
        disabled={selectionDisabled}
        inputProps={{ "aria-label": "表示中の候補をまとめて選択" }}
        onChange={onToggleAll}
      />
    </Box>

    <HeaderCell label="ファミリー">
      <FilterSelect
        label=""
        value={filters.family}
        options={familyOptions.map((family) => ({
          value: family,
          label: FAMILY_LABELS[family] ?? family,
        }))}
        onChange={(value) => {
          onFilterChange("family", value);
        }}
      />
    </HeaderCell>

    <HeaderCell label="codec string">
      <TextField
        size="small"
        placeholder="avc1.64…"
        value={filters.codec}
        slotProps={{ htmlInput: { "aria-label": "codec string で絞り込む" } }}
        onChange={(event) => {
          onFilterChange("codec", event.target.value);
        }}
        sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
      />
    </HeaderCell>

    <HeaderCell label="方針 / ch">
      <FilterSelect
        label=""
        value={filters.variant}
        options={variantOptions.map((variant) => ({
          value: variant,
          label: variant,
        }))}
        onChange={(value) => {
          onFilterChange("variant", value);
        }}
      />
    </HeaderCell>

    <HeaderCell label="結果">
      <FilterSelect
        label=""
        value={filters.status}
        options={[
          { value: "pass", label: "成功" },
          { value: "warning", label: "成功/警告" },
          { value: "fail", label: "失敗" },
        ]}
        onChange={(value) => {
          onFilterChange("status", value);
        }}
      />
    </HeaderCell>

    <HeaderCell label="詳細">
      <TextField
        size="small"
        placeholder="エラー・警告で絞り込む"
        value={filters.details}
        slotProps={{ htmlInput: { "aria-label": "詳細で絞り込む" } }}
        onChange={(event) => {
          onFilterChange("details", event.target.value);
        }}
        sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
      />
    </HeaderCell>

    <HeaderCell label="フレーム予算">
      <FilterSelect
        label=""
        value={filters.budget}
        options={[
          { value: "sustained", label: "継続検査済み" },
          { value: "over", label: "100% 超" },
        ]}
        onChange={(value) => {
          onFilterChange("budget", value);
        }}
      />
    </HeaderCell>

    <HeaderCell label="実行時間">
      <FilterSelect
        label=""
        value={filters.time}
        options={[
          { value: "quick", label: "1 秒未満" },
          { value: "slow", label: "1 秒以上" },
        ]}
        onChange={(value) => {
          onFilterChange("time", value);
        }}
      />
    </HeaderCell>
  </Box>
);
