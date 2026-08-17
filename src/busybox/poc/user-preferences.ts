import type { PocRoot } from "./contracts";

type PreferenceKey =
  | "colorScheme"
  | "contrast"
  | "reducedMotion"
  | "reducedTransparency"
  | "reducedData";

type PreferenceObjectLike = {
  value: string;
  override: string | null;
  validValues: readonly string[];
  requestOverride: (value: string) => Promise<void>;
  clearOverride: () => void;
};

type PreferenceManagerLike = Partial<
  Record<PreferenceKey, PreferenceObjectLike>
>;

const preferenceDefinitions: Record<
  PreferenceKey,
  { label: string; query: string; preferredValue: string }
> = {
  colorScheme: {
    label: "prefers-color-scheme",
    query: "(prefers-color-scheme: dark)",
    preferredValue: "dark",
  },
  contrast: {
    label: "prefers-contrast",
    query: "(prefers-contrast: more)",
    preferredValue: "more",
  },
  reducedMotion: {
    label: "prefers-reduced-motion",
    query: "(prefers-reduced-motion: reduce)",
    preferredValue: "reduce",
  },
  reducedTransparency: {
    label: "prefers-reduced-transparency",
    query: "(prefers-reduced-transparency: reduce)",
    preferredValue: "reduce",
  },
  reducedData: {
    label: "prefers-reduced-data",
    query: "(prefers-reduced-data: reduce)",
    preferredValue: "reduce",
  },
};

export function mount(root: PocRoot): () => void {
  const output = root.querySelector<HTMLOutputElement>(
    "#user-preferences-status",
  );
  const navigatorWithPreferences = navigator as Navigator & {
    preferences?: PreferenceManagerLike;
  };
  const preferences = navigatorWithPreferences.preferences;

  const writeStatus = (message: string) => {
    if (output) output.value = message;
  };

  const describe = (key: PreferenceKey) => {
    const preference = preferences?.[key];
    const definition = preferenceDefinitions[key];
    if (!preference) return `${definition.label}: unsupported`;
    const media = window.matchMedia(definition.query);
    return `${definition.label}: value=${preference.value}, override=${preference.override ?? "none"}, mediaMatches=${media.matches}, valid=${preference.validValues.join("|")}`;
  };

  const refresh = () => {
    if (!preferences) {
      writeStatus(
        "navigator.preferences unavailable; no synthetic media-query path is used.",
      );
      return;
    }
    writeStatus(
      (Object.keys(preferenceDefinitions) as PreferenceKey[])
        .map(describe)
        .join("\n"),
    );
  };

  const listeners: Array<
    [HTMLButtonElement, (event: Event) => void | Promise<void>]
  > = [];
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-user-preference]",
  )) {
    const listener = async () => {
      const key = button.dataset.userPreference as PreferenceKey | undefined;
      if (!key || !preferences?.[key]) {
        refresh();
        return;
      }
      const preference = preferences[key];
      const requested = preferenceDefinitions[key].preferredValue;
      if (!preference.validValues.includes(requested)) {
        writeStatus(
          `${preferenceDefinitions[key].label}: ${requested} is not a valid value (${preference.validValues.join("|")}).`,
        );
        return;
      }
      try {
        await preference.requestOverride(requested);
        writeStatus(
          `${describe(key)}\n実overrideを受け付けました。clear後に再確認してください。`,
        );
      } catch (error) {
        writeStatus(
          `${preferenceDefinitions[key].label}: requestOverride failed (${error instanceof Error ? error.name : "error"}).`,
        );
      }
    };
    button.addEventListener("click", listener);
    listeners.push([button, listener]);
  }
  for (const button of root.querySelectorAll<HTMLButtonElement>(
    "[data-user-preference-clear]",
  )) {
    const listener = () => {
      const key = button.dataset.userPreferenceClear as
        | PreferenceKey
        | undefined;
      const preference = key ? preferences?.[key] : undefined;
      preference?.clearOverride();
      refresh();
    };
    button.addEventListener("click", listener);
    listeners.push([button, listener]);
  }

  refresh();
  return () => {
    for (const [button, listener] of listeners) {
      button.removeEventListener("click", listener);
    }
    for (const key of Object.keys(preferenceDefinitions) as PreferenceKey[]) {
      preferences?.[key]?.clearOverride();
    }
  };
}
