import { Box, Paper, Stack, Typography } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useSustainedInputMode } from "../../atoms/preferences";
import { useResults } from "../../atoms/report";
import type { ResultFilters } from "../../domain/filters";
import type { UnitResult } from "../../domain/types";
import { useDetailsSearchText } from "../../utils/messages";
import {
  filterResults,
  getFilterOptions,
  useResultFilters,
  useSelectedIds,
  useSetResultFilter,
  useToggleManySelection,
  useToggleSelection,
} from "./atoms";
import { RESULT_ROW_HEIGHT, RESULT_ROW_OVERSCAN } from "./consts";
import { ResultRow } from "./ResultRow";
import { ResultTableHeader } from "./ResultTableHeader";

export const ResultTable = () => {
  const { t } = useTranslation();
  const detailsSearchText = useDetailsSearchText();
  const results = useResults();
  const filters = useResultFilters();
  const setFilter = useSetResultFilter();
  const selectedIds = useSelectedIds();
  const toggleSelection = useToggleSelection();
  const toggleMany = useToggleManySelection();
  const inputMode = useSustainedInputMode();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousTopIdRef = useRef<string | null>(null);
  const previousLengthRef = useRef(0);

  const filtered = useMemo(
    () => filterResults(results, filters, detailsSearchText),
    [results, filters, detailsSearchText],
  );
  const options = useMemo(() => getFilterOptions(results), [results]);

  // ライブ入力の Sustained test は映像フレームしか供給できないため、音声候補は選べない。
  const isSelectable = useCallback(
    (kind: UnitResult["kind"]) => inputMode !== "live" || kind === "video",
    [inputMode],
  );
  const selectableIds = useMemo(
    () =>
      filtered
        .filter((result) => isSelectable(result.kind))
        .map((result) => result.id),
    [filtered, isSelectable],
  );
  const selectedVisibleCount = selectableIds.filter((id) =>
    selectedIds.has(id),
  ).length;
  const allSelected =
    selectableIds.length > 0 && selectedVisibleCount === selectableIds.length;
  const someSelected = !allSelected && selectedVisibleCount > 0;

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => RESULT_ROW_HEIGHT,
    overscan: RESULT_ROW_OVERSCAN,
    getItemKey: (index) => filtered[index]?.id ?? index,
  });

  /**
   * 結果は新しいものから先頭に積まれる。利用者が下へスクロールしている最中に
   * 行が挿入されると、見ていた行が下へずれてしまうので、その分だけ補正する。
   */
  useLayoutEffect(() => {
    const element = scrollRef.current;
    const topId = filtered[0]?.id ?? null;
    const insertedAtTop =
      element !== null &&
      filtered.length === previousLengthRef.current + 1 &&
      topId !== previousTopIdRef.current &&
      filtered[1]?.id === previousTopIdRef.current;

    if (insertedAtTop && element.scrollTop > 0) {
      element.scrollTop += RESULT_ROW_HEIGHT;
    }
    previousTopIdRef.current = topId;
    previousLengthRef.current = filtered.length;
  }, [filtered]);

  // 絞り込みを変えたら一覧の先頭へ戻す。ずれた位置に留まると何が出ているか分からない。
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = 0;
    previousTopIdRef.current = null;
    previousLengthRef.current = 0;
  }, []);

  const handleFilterChange = (field: keyof ResultFilters, value: string) => {
    setFilter({ field, value });
    const element = scrollRef.current;
    if (element) element.scrollTop = 0;
    previousTopIdRef.current = null;
    previousLengthRef.current = 0;
  };

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {t("table.summary", {
          total: results.length,
          shown: filtered.length,
        })}
        {selectedIds.size > 0 &&
          t("table.selectedSuffix", { count: selectedIds.size })}
      </Typography>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box
          ref={scrollRef}
          role="table"
          aria-label={t("table.label")}
          sx={{ height: 560, overflow: "auto", position: "relative" }}
        >
          <ResultTableHeader
            filters={filters}
            familyOptions={options.families}
            variantOptions={options.variants}
            allSelected={allSelected}
            someSelected={someSelected}
            selectionDisabled={selectableIds.length === 0}
            onFilterChange={handleFilterChange}
            onToggleAll={() => {
              toggleMany({ unitIds: selectableIds, selected: !allSelected });
            }}
          />

          {filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {results.length === 0 ? t("table.empty") : t("table.noMatch")}
              </Typography>
            </Box>
          ) : (
            <Box
              role="rowgroup"
              sx={{
                position: "relative",
                height: virtualizer.getTotalSize(),
                width: "100%",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const result = filtered[virtualRow.index];
                if (!result) return null;
                return (
                  <ResultRow
                    key={virtualRow.key}
                    result={result}
                    selected={selectedIds.has(result.id)}
                    selectionDisabled={!isSelectable(result.kind)}
                    onToggle={toggleSelection}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Paper>
    </Stack>
  );
};
