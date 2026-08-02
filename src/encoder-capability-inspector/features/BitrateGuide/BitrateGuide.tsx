import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AUDIO_CANDIDATES, VIDEO_CANDIDATES } from "../../consts/candidates";
import {
  BITRATE_SOURCES,
  type BitrateFact,
  type BitrateGuidance,
  getBitrateGuidance,
  guidanceKey,
} from "../../domain/bitrateGuidance";
import { getFamilyKind } from "../../domain/families";
import { formatBitrate } from "../../utils/format";
import {
  BITRATE_GUIDE_GRID_TEMPLATE,
  BitrateGuideHeader,
} from "./BitrateGuideHeader";
import {
  type BitrateGuideFilters,
  type BitrateGuideSort,
  type BitrateGuideSortField,
  cycleBitrateGuideSort,
  EMPTY_BITRATE_GUIDE_FILTERS,
  filterBitrateGuidance,
  getBitrateGuideFilterOptions,
  sortBitrateGuidance,
} from "./filters";

const authorityKey = {
  standard: "bitrateGuide.authorityStandard",
  implementation: "bitrateGuide.authorityImplementation",
  recommendation: "bitrateGuide.authorityRecommendation",
  comparison: "bitrateGuide.authorityComparison",
} as const;

const factLabel = (
  fact: BitrateFact,
  t: (key: string, options?: Record<string, unknown>) => string,
  unit: "bitrate" | "quantizer" = "bitrate",
): string => {
  const formatValue = (value: number) =>
    unit === "quantizer" ? String(value) : formatBitrate(value);
  const context = fact.context
    ? t(`bitrateGuide.context.${fact.context}`)
    : undefined;
  let label: string;
  switch (fact.kind) {
    case "range":
      label =
        fact.min !== undefined &&
        fact.max !== undefined &&
        (unit === "quantizer" || fact.min > 0)
          ? t(
              unit === "quantizer"
                ? "bitrateGuide.quantizerRangeBetween"
                : "bitrateGuide.rangeBetween",
              {
                min: formatValue(fact.min),
                max: formatValue(fact.max),
              },
            )
          : fact.max !== undefined
            ? t(
                unit === "quantizer"
                  ? "bitrateGuide.quantizerRangeUpTo"
                  : "bitrateGuide.rangeUpTo",
                { max: formatValue(fact.max) },
              )
            : t(
                unit === "quantizer"
                  ? "bitrateGuide.quantizerRangeFrom"
                  : "bitrateGuide.rangeFrom",
                {
                  min: formatValue(fact.min ?? 0),
                },
              );
      break;
    case "discrete":
      label = t(
        unit === "quantizer"
          ? "bitrateGuide.quantizerDiscrete"
          : "bitrateGuide.discrete",
        {
          values: (fact.values ?? []).map(formatValue).join(" / "),
        },
      );
      break;
    case "dynamic":
      label = t("bitrateGuide.dynamicSupport");
      break;
    case "unbounded":
      label = t("bitrateGuide.unbounded");
      break;
    case "none":
      label = t(
        fact.context === "noUniversalValue"
          ? "bitrateGuide.noUniversalValue"
          : "bitrateGuide.noPublishedValue",
      );
      break;
    case "target":
      label =
        unit === "quantizer"
          ? t("bitrateGuide.quantizerTarget", {
              value: String(fact.value ?? 0),
            })
          : formatValue(fact.value ?? 0);
      break;
  }
  return context ? `${label} · ${context}` : label;
};

const FactList = ({
  heading,
  facts,
  unit = "bitrate",
}: {
  heading: string;
  facts: readonly BitrateFact[];
  unit?: "bitrate" | "quantizer";
}) => {
  const { t } = useTranslation();
  return (
    <Box>
      {heading && (
        <Typography variant="subtitle2" gutterBottom>
          {heading}
        </Typography>
      )}
      {facts.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("bitrateGuide.noPublishedValue")}
        </Typography>
      ) : (
        facts.map((fact) => (
          <Box
            key={`${fact.source ?? "none"}-${fact.context ?? ""}-${fact.kind}-${fact.min ?? ""}-${fact.max ?? ""}-${fact.value ?? ""}`}
            sx={{ mb: 0.75 }}
          >
            <Typography variant="body2">
              {factLabel(fact, t, unit)}
              {" · "}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                {t(authorityKey[fact.authority])}
              </Typography>
            </Typography>
            {fact.source && (
              <Link
                href={BITRATE_SOURCES[fact.source].url}
                target="_blank"
                rel="noreferrer"
                variant="caption"
              >
                {BITRATE_SOURCES[fact.source].title}
              </Link>
            )}
          </Box>
        ))
      )}
    </Box>
  );
};

const QuantizerDetails = ({
  guidance,
}: {
  guidance: NonNullable<BitrateGuidance["quantizer"]>;
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "grid", gap: 0.75 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t("bitrateGuide.quantizerHeading")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {guidance.qualityDirection === "lowerIsHigherQuality"
          ? t("bitrateGuide.quantizerLowerIsHigherQuality")
          : t("bitrateGuide.quantizerNotApplicable")}
      </Typography>
      <FactList
        heading={t("bitrateGuide.quantizerSupportHeading")}
        facts={guidance.support}
        unit="quantizer"
      />
      <FactList
        heading={t("bitrateGuide.quantizerRecommendationHeading")}
        facts={guidance.recommendations}
        unit="quantizer"
      />
      {guidance.comparisonValue !== null && (
        <Typography variant="caption" color="text.secondary">
          {t("bitrateGuide.quantizerComparisonValue", {
            value: guidance.comparisonValue,
          })}
        </Typography>
      )}
    </Box>
  );
};

export const BitrateGuidanceDetails = ({
  guidance,
  dialog = false,
}: {
  guidance: BitrateGuidance;
  dialog?: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <Typography variant={dialog ? "body2" : "body1"} color="text.secondary">
        {guidance.profile}
        {guidance.level ? ` · Level ${guidance.level}` : ""}
      </Typography>
      <FactList
        heading={t("bitrateGuide.supportHeading")}
        facts={guidance.support}
      />
      <FactList
        heading={t("bitrateGuide.recommendationHeading")}
        facts={guidance.recommendations}
      />
      {guidance.quantizer && <QuantizerDetails guidance={guidance.quantizer} />}
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {guidance.testBitrate === null
            ? t("bitrateGuide.testQuantizer", {
                value: guidance.testQuantizer ?? "—",
              })
            : t("bitrateGuide.testValue", {
                value: formatBitrate(guidance.testBitrate),
              })}
        </Typography>
      </Box>
    </Box>
  );
};

export const BitrateInfoButton = ({
  guidance,
}: {
  guidance: BitrateGuidance;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton
        size="small"
        aria-label={t("bitrateGuide.infoButton", { codec: guidance.codec })}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <InfoOutlinedIcon fontSize="inherit" />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {t("bitrateGuide.dialogTitle", { codec: guidance.codec })}
        </DialogTitle>
        <DialogContent dividers>
          <BitrateGuidanceDetails guidance={guidance} dialog />
        </DialogContent>
        <DialogActions>
          <Button variant="text" size="small" onClick={() => setOpen(false)}>
            {t("bitrateGuide.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const BitrateGuideRow = ({
  guidance,
  index,
  measureElement,
  style,
}: {
  guidance: BitrateGuidance;
  index: number;
  measureElement: (element: Element | null) => void;
  style?: React.CSSProperties;
}) => {
  const { t } = useTranslation();
  return (
    <Box
      ref={measureElement}
      data-index={index}
      role="row"
      style={style}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        display: "grid",
        gridTemplateColumns: BITRATE_GUIDE_GRID_TEMPLATE,
        columnGap: 1,
        minWidth: 1110,
        width: "100%",
        px: 1,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box role="cell" sx={{ minWidth: 0 }}>
        <Typography variant="body2">
          {t(`family.${guidance.family}`, { defaultValue: guidance.family })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t(`kind.${getFamilyKind(guidance.family)}`)}
        </Typography>
      </Box>
      <Box role="cell" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {guidance.codec}
        </Typography>
      </Box>
      <Box role="cell" sx={{ minWidth: 0 }}>
        <Typography variant="body2">
          {guidance.profile}
          {guidance.level ? ` · Level ${guidance.level}` : ""}
        </Typography>
      </Box>
      <Box role="cell" sx={{ minWidth: 0 }}>
        <FactList heading="" facts={guidance.support} />
      </Box>
      <Box role="cell" sx={{ minWidth: 0 }}>
        <FactList heading="" facts={guidance.recommendations} />
      </Box>
      <Box role="cell" sx={{ minWidth: 0 }}>
        {guidance.quantizer ? (
          <QuantizerDetails guidance={guidance.quantizer} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export const BitrateGuide = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<BitrateGuideFilters>(
    EMPTY_BITRATE_GUIDE_FILTERS,
  );
  const [sort, setSort] = useState<BitrateGuideSort | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const entries = useMemo(() => {
    const unique = new Map<string, BitrateGuidance>();
    for (const candidate of [...VIDEO_CANDIDATES, ...AUDIO_CANDIDATES]) {
      const guidance = getBitrateGuidance(candidate);
      if (!unique.has(guidanceKey(guidance))) {
        unique.set(guidanceKey(guidance), guidance);
      }
    }
    return [...unique.values()];
  }, []);
  const filteredEntries = useMemo(
    () => sortBitrateGuidance(filterBitrateGuidance(entries, filters), sort),
    [entries, filters, sort],
  );
  const options = useMemo(
    () => getBitrateGuideFilterOptions(entries),
    [entries],
  );
  const virtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 260,
    overscan: 6,
    getItemKey: (index) =>
      guidanceKey(filteredEntries[index] as BitrateGuidance),
  });

  useEffect(() => {
    const hasActiveView = Object.values(filters).some(Boolean) || sort !== null;
    if (hasActiveView) {
      scrollRef.current?.scrollTo({ top: 0 });
    }
  }, [filters, sort]);

  const handleFilterChange = (
    field: keyof BitrateGuideFilters,
    value: string,
  ) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSort = (field: BitrateGuideSortField) => {
    setSort((current) => cycleBitrateGuideSort(current, field));
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{t("bitrateGuide.heading")}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t("bitrateGuide.description")}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {t("bitrateGuide.summary", {
              total: entries.length,
              shown: filteredEntries.length,
            })}
          </Typography>
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <Box
              ref={scrollRef}
              role="table"
              aria-label={t("bitrateGuide.tableLabel")}
              sx={{
                height: 560,
                overflow: "auto",
                position: "relative",
              }}
            >
              <BitrateGuideHeader
                filters={filters}
                sort={sort}
                familyOptions={options.families}
                profileOptions={options.profiles}
                onFilterChange={handleFilterChange}
                onSort={handleSort}
              />
              {filteredEntries.length === 0 ? (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("bitrateGuide.noMatch")}
                  </Typography>
                </Box>
              ) : (
                <Box
                  role="rowgroup"
                  sx={{
                    position: "relative",
                    height: virtualizer.getTotalSize(),
                    minWidth: 1110,
                    width: "100%",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const guidance = filteredEntries[virtualRow.index];
                    if (!guidance) return null;
                    return (
                      <BitrateGuideRow
                        key={virtualRow.key}
                        guidance={guidance}
                        index={virtualRow.index}
                        measureElement={virtualizer.measureElement}
                        style={{
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      />
                    );
                  })}
                </Box>
              )}
            </Box>
          </Paper>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
