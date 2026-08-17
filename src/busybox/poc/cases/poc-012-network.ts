import type { PocRoot } from "../contracts";

type NetworkInformationLike = EventTarget & {
  type?: string;
  onchange?: ((event: Event) => void) | null;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const observe = root.querySelector<HTMLButtonElement>(
    "[data-network-observe]",
  );
  const clear = root.querySelector<HTMLButtonElement>("[data-network-clear]");
  const records = new Set<string>();
  const connection = (
    navigator as Navigator & { connection?: NetworkInformationLike }
  ).connection;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const observeType = () => {
    const type = connection?.type;
    if (!type) {
      render("connection.typeを公開していません。速度やUAから推定しません。");
      root.dataset.pocState = "unsupported";
      return;
    }
    records.add(type);
    render(`明示観測: type=${type}\n累積値: ${[...records].sort().join(", ")}`);
    root.dataset.pocState = "partial";
  };
  const reset = () => {
    records.clear();
    delete root.dataset.pocState;
    render("未実行。明示buttonからだけconnection.typeを読みます。");
  };
  observe?.addEventListener("click", observeType);
  clear?.addEventListener("click", reset);
  return () => {
    observe?.removeEventListener("click", observeType);
    clear?.removeEventListener("click", reset);
  };
}
