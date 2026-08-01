import { Box, Paper, Stack, Typography } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { useResults } from "../../atoms/report";
import type { ResultFilters } from "../../domain/filters";
import type { SortField } from "../../domain/sorting";
import { useDetailsSearchText } from "../../utils/messages";
import {
  filterResults,
  getFilterOptions,
  sortResults,
  useCycleResultSort,
  useResultFilters,
  useResultSort,
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
  const sort = useResultSort();
  const cycleSort = useCycleResultSort();
  const selectedIds = useSelectedIds();
  const toggleSelection = useToggleSelection();
  const toggleMany = useToggleManySelection();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const previousTopIdRef = useRef<string | null>(null);
  const previousLengthRef = useRef(0);

  const filtered = useMemo(
    () =>
      sortResults(
        filterResults(results, filters, detailsSearchText),
        sort,
        detailsSearchText,
      ),
    [results, filters, sort, detailsSearchText],
  );
  const options = useMemo(() => getFilterOptions(results), [results]);

  // ライブ入力でも音声トラックを共有すれば音声候補を検査できるので、種別では絞らない。
  const selectableIds = useMemo(
    () => filtered.map((result) => result.id),
    [filtered],
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
   * 既定の並びでは結果が新しいものから先頭に積まれる。利用者が下へスクロール
   * している最中に行が挿入されると、見ていた行が下へずれてしまうので補正する。
   * 並べ替え中は行がどこに入るか分からないため、補正しない。
   */
  useLayoutEffect(() => {
    const element = scrollRef.current;
    const topId = filtered[0]?.id ?? null;
    const insertedAtTop =
      sort === null &&
      element !== null &&
      filtered.length === previousLengthRef.current + 1 &&
      topId !== previousTopIdRef.current &&
      filtered[1]?.id === previousTopIdRef.current;

    if (insertedAtTop && element.scrollTop > 0) {
      element.scrollTop += RESULT_ROW_HEIGHT;
    }
    previousTopIdRef.current = topId;
    previousLengthRef.current = filtered.length;
  }, [filtered, sort]);

  // 絞り込みを変えたら一覧の先頭へ戻す。ずれた位置に留まると何が出ているか分からない。
  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = 0;
    previousTopIdRef.current = null;
    previousLengthRef.current = 0;
  }, []);

  const scrollToTop = () => {
    const element = scrollRef.current;
    if (element) element.scrollTop = 0;
    previousTopIdRef.current = null;
    previousLengthRef.current = 0;
  };

  const handleFilterChange = (field: keyof ResultFilters, value: string) => {
    setFilter({ field, value });
    scrollToTop();
  };

  const handleSort = (field: SortField) => {
    cycleSort(field);
    scrollToTop();
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
            sort={sort}
            onSort={handleSort}
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
