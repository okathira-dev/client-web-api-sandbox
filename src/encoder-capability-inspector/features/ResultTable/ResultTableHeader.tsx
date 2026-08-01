import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  Checkbox,
  MenuItem,
  TableSortLabel,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getFamilyKind } from "../../domain/families";
import type { ResultFilters } from "../../domain/filters";
import type { ResultSort, SortField } from "../../domain/sorting";
import { RESULT_GRID_TEMPLATE } from "./consts";

/**
 * 見出しのセル。
 *
 * 並べ替えられることが伝わるよう、未ソートのときも中立の矢印を薄く出しておく。
 * 既定の `TableSortLabel` は押すまでアイコンを隠すので、押せると気づけない。
 */
const HeaderCell = ({
  label,
  field,
  sort,
  onSort,
  hint,
  children,
}: {
  label: string;
  field: SortField;
  sort: ResultSort | null;
  onSort: (field: SortField) => void;
  /** 見出しに補足がある列だけ渡す。 */
  hint?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const active = sort?.field === field;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}
    >
      <Tooltip
        title={[hint, t("table.sortHint")].filter(Boolean).join(" / ")}
        placement="top"
      >
        <TableSortLabel
          active={active}
          direction={active ? sort.direction : "asc"}
          IconComponent={active ? undefined : UnfoldMoreIcon}
          onClick={() => {
            onSort(field);
          }}
          sx={{
            fontSize: 12,
            color: "text.secondary",
            alignSelf: "flex-start",
            maxWidth: "100%",
            "& .MuiTableSortLabel-icon": {
              fontSize: 16,
              // 未ソートでも薄く出し続ける。既定では opacity 0 で隠れてしまう。
              opacity: active ? 1 : 0.45,
            },
          }}
        >
          <Box
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Box>
        </TableSortLabel>
      </Tooltip>
      {children}
    </Box>
  );
};

const FilterSelect = ({
  allLabel,
  value,
  options,
  onChange,
}: {
  allLabel: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <TextField
    select
    size="small"
    value={value}
    onChange={(event) => {
      onChange(event.target.value);
    }}
    slotProps={{ inputLabel: { shrink: true } }}
    sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
  >
    <MenuItem value="">{allLabel}</MenuItem>
    {options.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </TextField>
);

export type ResultTableHeaderProps = {
  readonly filters: ResultFilters;
  readonly sort: ResultSort | null;
  readonly familyOptions: readonly string[];
  readonly variantOptions: readonly string[];
  readonly allSelected: boolean;
  readonly someSelected: boolean;
  readonly selectionDisabled: boolean;
  readonly onFilterChange: (field: keyof ResultFilters, value: string) => void;
  readonly onSort: (field: SortField) => void;
  readonly onToggleAll: () => void;
};

export const ResultTableHeader = ({
  filters,
  sort,
  familyOptions,
  variantOptions,
  allSelected,
  someSelected,
  selectionDisabled,
  onFilterChange,
  onSort,
  onToggleAll,
}: ResultTableHeaderProps) => {
  const { t } = useTranslation();
  const allLabel = t("table.filterAll");
  const sortProps = { sort, onSort };

  return (
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
          inputProps={{ "aria-label": t("table.selectAll") }}
          onChange={onToggleAll}
        />
      </Box>

      <HeaderCell label={t("table.columnFamily")} field="family" {...sortProps}>
        <FilterSelect
          allLabel={allLabel}
          value={filters.family}
          options={familyOptions.map((family) => ({
            value: family,
            // 映像と音声が同じ並びに出るので、どちらの検査か分かるようにする。
            label: `${t(`kind.${getFamilyKind(family)}`)} · ${t(
              `family.${family}`,
              { defaultValue: family },
            )}`,
          }))}
          onChange={(value) => {
            onFilterChange("family", value);
          }}
        />
      </HeaderCell>

      <HeaderCell label={t("table.columnCodec")} field="codec" {...sortProps}>
        <TextField
          size="small"
          placeholder={t("table.filterCodecPlaceholder")}
          value={filters.codec}
          slotProps={{
            htmlInput: { "aria-label": t("table.columnCodec") },
          }}
          onChange={(event) => {
            onFilterChange("codec", event.target.value);
          }}
          sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
        />
      </HeaderCell>

      <HeaderCell
        label={t("table.columnVariant")}
        field="variant"
        {...sortProps}
      >
        <FilterSelect
          allLabel={allLabel}
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

      <HeaderCell label={t("table.columnStatus")} field="status" {...sortProps}>
        <FilterSelect
          allLabel={allLabel}
          value={filters.status}
          options={[
            { value: "pass", label: t("table.statusPass") },
            { value: "warning", label: t("table.statusWarning") },
            { value: "fail", label: t("table.statusFail") },
          ]}
          onChange={(value) => {
            onFilterChange("status", value);
          }}
        />
      </HeaderCell>

      <HeaderCell
        label={t("table.columnDetails")}
        field="details"
        {...sortProps}
      >
        <TextField
          size="small"
          placeholder={t("table.filterDetailsPlaceholder")}
          value={filters.details}
          slotProps={{
            htmlInput: { "aria-label": t("table.filterDetailsPlaceholder") },
          }}
          onChange={(event) => {
            onFilterChange("details", event.target.value);
          }}
          sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
        />
      </HeaderCell>

      <HeaderCell
        label={t("table.columnBudget")}
        field="budget"
        hint={t("table.budgetHint")}
        {...sortProps}
      >
        <FilterSelect
          allLabel={allLabel}
          value={filters.budget}
          options={[
            { value: "over", label: t("table.budgetOver") },
            { value: "under", label: t("table.budgetUnder") },
          ]}
          onChange={(value) => {
            onFilterChange("budget", value);
          }}
        />
      </HeaderCell>

      <HeaderCell
        label={t("table.columnSustained")}
        field="sustained"
        {...sortProps}
      >
        <FilterSelect
          allLabel={allLabel}
          value={filters.sustained}
          options={[
            { value: "done", label: t("table.sustainedDone") },
            { value: "none", label: t("table.sustainedNone") },
            { value: "over", label: t("table.budgetOver") },
            { value: "under", label: t("table.budgetUnder") },
          ]}
          onChange={(value) => {
            onFilterChange("sustained", value);
          }}
        />
      </HeaderCell>

      <HeaderCell label={t("table.columnTime")} field="time" {...sortProps}>
        <FilterSelect
          allLabel={allLabel}
          value={filters.time}
          options={[
            { value: "quick", label: t("table.timeQuick") },
            { value: "slow", label: t("table.timeSlow") },
          ]}
          onChange={(value) => {
            onFilterChange("time", value);
          }}
        />
      </HeaderCell>
    </Box>
  );
};
