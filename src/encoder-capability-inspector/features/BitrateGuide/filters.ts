import type {
  BitrateFact,
  BitrateGuidance,
} from "../../domain/bitrateGuidance";
import { getFamilyOrder } from "../../domain/families";

export type BitrateGuideFilters = {
  readonly family: string;
  readonly codec: string;
  readonly profile: string;
};

export const EMPTY_BITRATE_GUIDE_FILTERS: BitrateGuideFilters = {
  family: "",
  codec: "",
  profile: "",
};

export type BitrateGuideSortField =
  | "family"
  | "codec"
  | "profile"
  | "support"
  | "recommendation"
  | "quantizer";

export type BitrateGuideSortDirection = "asc" | "desc";

export type BitrateGuideSort = {
  readonly field: BitrateGuideSortField;
  readonly direction: BitrateGuideSortDirection;
};

const getProfileLabel = (guidance: BitrateGuidance): string =>
  [guidance.profile, guidance.level].filter(Boolean).join(" ");

const getFactSortKey = (facts: readonly BitrateFact[]): string =>
  facts
    .map((fact) => {
      const values = [fact.min, fact.max, ...(fact.values ?? []), fact.value]
        .filter((value): value is number => value !== undefined)
        .join(" ");
      return `${fact.kind} ${values} ${fact.context ?? ""}`;
    })
    .join(" ");

export const filterBitrateGuidance = (
  entries: readonly BitrateGuidance[],
  filters: BitrateGuideFilters,
): BitrateGuidance[] => {
  const codecFilter = filters.codec.trim().toLowerCase();
  const profileFilter = filters.profile.trim().toLowerCase();

  return entries.filter((guidance) => {
    if (filters.family && guidance.family !== filters.family) return false;
    if (codecFilter && !guidance.codec.toLowerCase().includes(codecFilter)) {
      return false;
    }
    if (
      profileFilter &&
      !getProfileLabel(guidance).toLowerCase().includes(profileFilter)
    ) {
      return false;
    }
    return true;
  });
};

const compareGuidance = (
  left: BitrateGuidance,
  right: BitrateGuidance,
  field: BitrateGuideSortField,
): number => {
  switch (field) {
    case "family":
      return getFamilyOrder(left.family) - getFamilyOrder(right.family);
    case "codec":
      return left.codec.localeCompare(right.codec);
    case "profile":
      return getProfileLabel(left).localeCompare(getProfileLabel(right));
    case "support":
      return getFactSortKey(left.support).localeCompare(
        getFactSortKey(right.support),
        undefined,
        { numeric: true },
      );
    case "recommendation":
      return getFactSortKey(left.recommendations).localeCompare(
        getFactSortKey(right.recommendations),
        undefined,
        { numeric: true },
      );
    case "quantizer":
      return getFactSortKey(left.quantizer?.support ?? []).localeCompare(
        getFactSortKey(right.quantizer?.support ?? []),
        undefined,
        { numeric: true },
      );
  }
};

export const sortBitrateGuidance = (
  entries: readonly BitrateGuidance[],
  sort: BitrateGuideSort | null,
): BitrateGuidance[] => {
  if (!sort) return [...entries];
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...entries].sort(
    (left, right) => sign * compareGuidance(left, right, sort.field),
  );
};

export const cycleBitrateGuideSort = (
  current: BitrateGuideSort | null,
  field: BitrateGuideSortField,
): BitrateGuideSort | null => {
  if (current?.field !== field) return { field, direction: "asc" };
  if (current.direction === "asc") return { field, direction: "desc" };
  return null;
};

export const getBitrateGuideFilterOptions = (
  entries: readonly BitrateGuidance[],
) => ({
  families: [...new Set(entries.map((entry) => entry.family))].sort(
    (left, right) => getFamilyOrder(left) - getFamilyOrder(right),
  ),
  profiles: [...new Set(entries.map(getProfileLabel))].sort((left, right) =>
    left.localeCompare(right),
  ),
});
