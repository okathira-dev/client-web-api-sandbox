export type PocState = "not-run" | "partial" | "pass" | "fail" | "unsupported";

export type PocRoot = HTMLElement;

export type PocMount = (root: PocRoot) => undefined | (() => void);

export type PocCase = {
  id: string;
  mount: PocMount;
};

export function setPocState(
  root: PocRoot,
  state: PocState,
  message: string,
): void {
  root.dataset.pocState = state;
  const output = root.querySelector<HTMLOutputElement>(
    "[data-poc-status], output",
  );
  if (output) output.value = message;
}

export function getPocStatus(root: PocRoot): HTMLOutputElement {
  const existing = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  if (existing) return existing;
  const output = document.createElement("output");
  output.dataset.pocStatus = "true";
  output.className = "media-status";
  output.value = "未実行";
  root.append(output);
  return output;
}

export function appendPocLog(root: PocRoot, message: string): void {
  const output = getPocStatus(root);
  output.value = output.value ? `${output.value}\n${message}` : message;
}
