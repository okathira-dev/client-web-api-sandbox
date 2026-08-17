import type { PocRoot } from "../contracts";

type IdentityCredentialLike = Credential & { token?: string };

const POC_PROVIDER = {
  configURL: "https://mockfedcm.com/api/fedcm/config.json",
  clientId: "busybox-poc-027",
} as const;

type FedCmRequestOptions = CredentialRequestOptions & {
  identity: {
    context: "signin";
    mode: "active";
    providers: readonly [typeof POC_PROVIDER];
  };
};

export function mount(root: PocRoot): () => void {
  const status = root.querySelector<HTMLOutputElement>("[data-poc-status]");
  const begin = root.querySelector<HTMLButtonElement>("[data-fedcm-start]");
  const clear = root.querySelector<HTMLButtonElement>("[data-fedcm-clear]");
  const render = (message: string) => {
    if (status) status.value = message;
  };
  const signIn = async () => {
    const credentials = navigator.credentials as unknown as {
      get: (options: FedCmRequestOptions) => Promise<Credential | null>;
    };
    if (!("IdentityCredential" in window) || !credentials?.get) {
      render(
        "FedCM IdentityCredential入口がありません。通常OAuthへfallbackしません。",
      );
      root.dataset.pocState = "unsupported";
      return;
    }
    try {
      const credential = (await credentials.get({
        identity: {
          context: "signin",
          mode: "active",
          providers: [POC_PROVIDER],
        },
      })) as IdentityCredentialLike | null;
      if (!credential) {
        render("browser chooserが取消またはaccountなしでした。");
        root.dataset.pocState = "partial";
        return;
      }
      render(
        "browser所有のFedCM credentialを受信。tokenは保存せず破棄します。",
      );
      root.dataset.pocState = "pass";
    } catch (error) {
      render(
        `FedCM未完了: ${error instanceof Error ? `${error.name}: ${error.message}` : "error"}`,
      );
      root.dataset.pocState = "partial";
    }
  };
  const reset = () => {
    delete root.dataset.pocState;
    render(
      "未実行。PoC専用providerへ実データを入力しないでください。製品providerは別途監査します。",
    );
  };
  const beginListener = () => void signIn();
  begin?.addEventListener("click", beginListener);
  clear?.addEventListener("click", reset);
  return () => {
    begin?.removeEventListener("click", beginListener);
    clear?.removeEventListener("click", reset);
  };
}
