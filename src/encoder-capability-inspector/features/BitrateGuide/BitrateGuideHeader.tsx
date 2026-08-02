import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  Box,
  MenuItem,
  TableSortLabel,
  TextField,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { getFamilyKind } from "../../domain/families";
import type {
  BitrateGuideFilters,
  BitrateGuideSort,
  BitrateGuideSortField,
} from "./filters";

export const BITRATE_GUIDE_GRID_TEMPLATE =
  "100px minmax(160px, 1.1fr) minmax(160px, 1.2fr) minmax(210px, 1.5fr) minmax(210px, 1.5fr) minmax(270px, 2fr)";

const HeaderCell = ({
  label,
  field,
  sort,
  onSort,
  children,
}: {
  label: string;
  field: BitrateGuideSortField;
  sort: BitrateGuideSort | null;
  onSort: (field: BitrateGuideSortField) => void;
  children?: React.ReactNode;
}) => {
  const { t } = useTranslation();
  const active = sort?.field === field;
  return (
    <Box
      role="columnheader"
      sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}
    >
      <Tooltip title={t("bitrateGuide.sortHint")} placement="top">
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
            flexDirection: "row",
            "& .MuiTableSortLabel-icon": {
              fontSize: 16,
              flexShrink: 0,
              opacity: active ? 1 : 0.45,
            },
          }}
        >
          <Box
            component="span"
            sx={{
              minWidth: 0,
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
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation();
  return (
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
      <MenuItem value="">{t("bitrateGuide.filterAll")}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export const BitrateGuideHeader = ({
  filters,
  sort,
  familyOptions,
  profileOptions,
  onFilterChange,
  onSort,
}: {
  filters: BitrateGuideFilters;
  sort: BitrateGuideSort | null;
  familyOptions: readonly string[];
  profileOptions: readonly string[];
  onFilterChange: (field: keyof BitrateGuideFilters, value: string) => void;
  onSort: (field: BitrateGuideSortField) => void;
}) => {
  const { t } = useTranslation();
  const sortProps = { sort, onSort };
  return (
    <Box
      role="row"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 2,
        display: "grid",
        gridTemplateColumns: BITRATE_GUIDE_GRID_TEMPLATE,
        alignItems: "end",
        columnGap: 1,
        minWidth: 1110,
        px: 1,
        py: 1,
        bgcolor: "background.paper",
        borderBottom: 2,
        borderColor: "divider",
      }}
    >
      <HeaderCell label={t("table.columnFamily")} field="family" {...sortProps}>
        <FilterSelect
          value={filters.family}
          options={familyOptions.map((family) => ({
            value: family,
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
          placeholder={t("bitrateGuide.filterCodecPlaceholder")}
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
        label={t("bitrateGuide.profileLevel")}
        field="profile"
        {...sortProps}
      >
        <TextField
          select
          size="small"
          value={filters.profile}
          onChange={(event) => {
            onFilterChange("profile", event.target.value);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ "& .MuiInputBase-root": { fontSize: 12 } }}
        >
          <MenuItem value="">{t("bitrateGuide.filterAll")}</MenuItem>
          {profileOptions.map((profile) => (
            <MenuItem key={profile} value={profile}>
              {profile}
            </MenuItem>
          ))}
        </TextField>
      </HeaderCell>

      <HeaderCell
        label={t("bitrateGuide.supportHeading")}
        field="support"
        {...sortProps}
      />
      <HeaderCell
        label={t("bitrateGuide.recommendationHeading")}
        field="recommendation"
        {...sortProps}
      />
      <HeaderCell
        label={t("bitrateGuide.quantizerHeading")}
        field="quantizer"
        {...sortProps}
      />
    </Box>
  );
};
