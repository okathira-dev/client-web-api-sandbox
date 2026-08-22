import type { PocMount, PocRoot } from "./contracts";

type PocLoader = () => Promise<{ mount: PocMount }>;

type PocRegistration = {
  id: string;
  loader: PocLoader;
};

const registrations: readonly PocRegistration[] = [
  {
    id: "008",
    loader: () =>
      import("./user-preferences").then((m) => ({ mount: m.mount })),
  },
  {
    id: "009",
    loader: () =>
      import("./cases/poc-009-dnd").then((m) => ({ mount: m.mount })),
  },
  {
    id: "012",
    loader: () =>
      import("./cases/poc-012-network").then((m) => ({ mount: m.mount })),
  },
  {
    id: "018",
    loader: () => import("./text-fragment").then((m) => ({ mount: m.mount })),
  },
  {
    id: "019",
    loader: () =>
      import("./cases/poc-019-remote").then((m) => ({ mount: m.mount })),
  },
  {
    id: "020",
    loader: () =>
      import("./cases/poc-020-presentation").then((m) => ({ mount: m.mount })),
  },
  {
    id: "023",
    loader: () =>
      import("./cases/poc-023-xr").then((m) => ({ mount: m.mount })),
  },
  {
    id: "024",
    loader: () =>
      import("./cases/poc-024-periodic-sync").then((m) => ({ mount: m.mount })),
  },
  {
    id: "025",
    loader: () =>
      import("./cases/poc-025-otp").then((m) => ({ mount: m.mount })),
  },
  {
    id: "026",
    loader: () =>
      import("./cases/poc-026-contact").then((m) => ({ mount: m.mount })),
  },
  {
    id: "027",
    loader: () =>
      import("./cases/poc-027-fedcm").then((m) => ({ mount: m.mount })),
  },
  {
    id: "028",
    loader: () =>
      import("./cases/poc-028-payment-handler").then((m) => ({
        mount: m.mount,
      })),
  },
  {
    id: "029",
    loader: () => import("./local-font").then((m) => ({ mount: m.mount })),
  },
  {
    id: "032",
    loader: () => import("./text-fragment").then((m) => ({ mount: m.mount })),
  },
  {
    id: "033",
    loader: () =>
      import("./cases/poc-033-audio-session").then((m) => ({ mount: m.mount })),
  },
  ...["036", "037", "038", "041", "042", "046", "048", "051", "052", "053"].map(
    (id) => ({
      id,
      loader: () => import("./advanced-poc").then((m) => ({ mount: m.mount })),
    }),
  ),
];

const loaded = new WeakMap<PocRoot, () => void>();

function findRegistration(id: string): PocRegistration | undefined {
  return registrations.find((registration) => registration.id === id);
}

async function mountLazyCase(root: PocRoot): Promise<void> {
  if (loaded.has(root)) return;
  const id = root.dataset.poc;
  if (!id) return;
  const registration = findRegistration(id);
  if (!registration) return;
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const loadingMessage = `POC-${id}を読み込み中…`;
  if (status) status.value = loadingMessage;
  try {
    const module = await registration.loader();
    if (!root.matches("[open]")) return;
    const dispose = module.mount(root);
    loaded.set(root, dispose ?? (() => undefined));
    root.dataset.pocLoaded = "true";
    // A case may only attach listeners and have no action to report yet.
    // Never leave the shared status output showing a completed-looking load spinner.
    if (status?.value === loadingMessage) status.value = "未実行";
  } catch (error) {
    root.dataset.pocState = "fail";
    if (status) {
      status.value = `POC-${id}の読み込み失敗: ${error instanceof Error ? error.message : "unknown error"}`;
    }
  }
}

export function initPocRegistry(): void {
  for (const root of document.querySelectorAll<PocRoot>("[data-poc]")) {
    root.addEventListener("toggle", () => {
      if (root.matches("[open]")) {
        void mountLazyCase(root);
        return;
      }
      const dispose = loaded.get(root);
      dispose?.();
      loaded.delete(root);
      delete root.dataset.pocLoaded;
    });
    if (root.matches("[open]")) void mountLazyCase(root);
  }
}
