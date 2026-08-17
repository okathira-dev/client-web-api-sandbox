import type { PocRoot } from "../contracts";

type OTPCredentialLike = Credential & { code: string };

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const input = root.querySelector<HTMLInputElement>("[data-otp-input]");
  const requestButton =
    root.querySelector<HTMLButtonElement>("[data-otp-request]");
  const resetButton = root.querySelector<HTMLButtonElement>("[data-otp-reset]");
  let controller: AbortController | undefined;
  let autofillListener: ((event: Event) => void) | undefined;
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const request = async () => {
    const credentials = navigator.credentials as unknown as {
      get: (
        options?: CredentialRequestOptions & { otp?: { transport: string[] } },
      ) => Promise<Credential | null>;
    };
    if (!("OTPCredential" in window) || !credentials?.get) {
      render("WebOTP APIを公開していません。手入力へfallbackしません。");
      root.dataset.pocState = "unsupported";
      return;
    }
    controller?.abort();
    controller = new AbortController();
    render("OTP専用経路を待機中。実SMSを送信して確認します…");
    try {
      const credential = (await credentials.get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      })) as OTPCredentialLike | null;
      if (!credential?.code) {
        render("OTPCredentialが空でした。成功にはしません。");
        return;
      }
      if (input) input.value = credential.code;
      render(`trusted WebOTP取得: code length=${credential.code.length}`);
      root.dataset.pocState = "pass";
    } catch (error) {
      render(
        `WebOTP未完了: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const reset = () => {
    controller?.abort();
    controller = undefined;
    if (input) input.value = "";
    if (autofillListener && input)
      input.removeEventListener("input", autofillListener);
    delete root.dataset.pocState;
    render("未実行。paste・drop・script代入は成功経路ではありません。");
  };
  if (input) {
    autofillListener = (event: Event) => {
      if (!event.isTrusted || !input.value) return;
      let autofill = false;
      try {
        autofill = input.matches(":autofill");
      } catch {
        autofill = false;
      }
      if (autofill) {
        render(
          `OS AutoFillのtrusted入力を観測: code length=${input.value.length}`,
        );
        root.dataset.pocState = "pass";
      } else {
        render(
          "trusted inputは届きましたが:autofillを確認できないため成功にしません。",
        );
        root.dataset.pocState = "partial";
      }
    };
    input.addEventListener("input", autofillListener);
  }
  requestButton?.addEventListener("click", request);
  resetButton?.addEventListener("click", reset);
  return () => {
    controller?.abort();
    requestButton?.removeEventListener("click", request);
    resetButton?.removeEventListener("click", reset);
    if (autofillListener && input)
      input.removeEventListener("input", autofillListener);
  };
}
