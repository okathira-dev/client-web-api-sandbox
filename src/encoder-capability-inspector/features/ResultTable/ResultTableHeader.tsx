import { Box, Checkbox, MenuItem, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import type { ResultFilters } from "../../domain/filters";
import { RESULT_GRID_TEMPLATE } from "./consts";

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
}: ResultTableHeaderProps) => {
  const { t } = useTranslation();
  const allLabel = t("table.filterAll");

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

      <HeaderCell label={t("table.columnFamily")}>
        <FilterSelect
          allLabel={allLabel}
          value={filters.family}
          options={familyOptions.map((family) => ({
            value: family,
            label: t(`family.${family}`, { defaultValue: family }),
          }))}
          onChange={(value) => {
            onFilterChange("family", value);
          }}
        />
      </HeaderCell>

      <HeaderCell label={t("table.columnCodec")}>
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

      <HeaderCell label={t("table.columnVariant")}>
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

      <HeaderCell label={t("table.columnStatus")}>
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

      <HeaderCell label={t("table.columnDetails")}>
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

      <HeaderCell label={t("table.columnBudget")}>
        <FilterSelect
          allLabel={allLabel}
          value={filters.budget}
          options={[
            { value: "sustained", label: t("table.budgetSustained") },
            { value: "over", label: t("table.budgetOver") },
          ]}
          onChange={(value) => {
            onFilterChange("budget", value);
          }}
        />
      </HeaderCell>

      <HeaderCell label={t("table.columnTime")}>
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
