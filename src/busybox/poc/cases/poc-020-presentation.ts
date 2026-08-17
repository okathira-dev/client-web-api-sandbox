import type { PocRoot } from "../contracts";

type PresentationConnectionLike = EventTarget & {
  state?: string;
  send: (message: string) => void;
  close: () => void;
};
type PresentationRequestLike = {
  start: () => Promise<PresentationConnectionLike>;
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const start = root.querySelector<HTMLButtonElement>(
    "[data-presentation-start]",
  );
  const reset = root.querySelector<HTMLButtonElement>(
    "[data-presentation-reset]",
  );
  let connection: PresentationConnectionLike | undefined;
  let messageListener: ((event: Event) => void) | undefined;
  const round = crypto.randomUUID();
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const begin = async () => {
    const Request = (
      window as Window & {
        PresentationRequest?: new (urls: string[]) => PresentationRequestLike;
      }
    ).PresentationRequest;
    if (!Request) {
      render(
        "PresentationRequestがありません。通常window・iframeでは成功にしません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      const receiverUrl = new URL(
        "./presentation-receiver.html",
        location.href,
      );
      receiverUrl.searchParams.set("round", round);
      connection = await new Request([receiverUrl.href]).start();
      render(
        `Presentation connection=${connection.state ?? "connected"}。receiverのreadyを待っています。`,
      );
      messageListener = (event: Event) => {
        const message = (event as MessageEvent<string>).data;
        if (message === `ready:${round}`) {
          render("外部displayからcurrent roundのreadyを受信しました。");
          root.dataset.pocState = "pass";
        } else {
          render(
            `receiver message=${message}（round不一致なら成功にしません）`,
          );
        }
      };
      connection.addEventListener("message", messageListener);
    } catch (error) {
      render(
        `Presentation未接続: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const cleanup = () => {
    if (connection && messageListener)
      connection.removeEventListener("message", messageListener);
    connection?.close();
    connection = undefined;
    messageListener = undefined;
    delete root.dataset.pocState;
    render("connectionをcloseしました。");
  };
  const startListener = () => void begin();
  start?.addEventListener("click", startListener);
  reset?.addEventListener("click", cleanup);
  render(`未実行。receiver round=${round}`);
  return () => {
    if (connection && messageListener)
      connection.removeEventListener("message", messageListener);
    connection?.close();
    start?.removeEventListener("click", startListener);
    reset?.removeEventListener("click", cleanup);
  };
}
